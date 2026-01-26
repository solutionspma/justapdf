/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MOD PDF - FRONTEND AUTHENTICATION UTILITY
 * Handles token management, auth state, and protected route access
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const Auth = {
  GENESIS_EMAIL: 'justapdf@pitchmarketing.agency',
  API_BASE: '/.netlify/functions/api',
  TOKEN_KEY: 'justapdf_token',
  USER_KEY: 'justapdf_user',
  
  /**
   * Get current auth token
   */
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },
  
  /**
   * Get current user data
   */
  getUser() {
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (e) {
      return null;
    }
  },
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    
    if (!token || !user) return false;
    
    // Check if demo token is expired
    if (token.startsWith('demo_')) {
      try {
        const payload = JSON.parse(atob(token.replace('demo_', '')));
        if (payload.exp && Date.now() > payload.exp) {
          this.logout();
          return false;
        }
      } catch (e) {
        return false;
      }
    }
    
    return true;
  },
  
  /**
   * Check if user is Supra Admin (immutable)
   */
  isGenesis() {
    const user = this.getUser();
    return user && (user.isSupraAdmin || user.isGenesis || user.role === 'supra_admin' ||
                    user.role === 'root_master_admin' || 
                    user.email?.toLowerCase() === this.GENESIS_EMAIL.toLowerCase());
  },
  
  /**
   * Check if user has specific role
   */
  hasRole(role) {
    const user = this.getUser();
    if (!user) return false;
    
    // Supra admin has all roles
    if (this.isGenesis()) return true;
    
    const roleHierarchy = {
      supra_admin: 110,
      root_master_admin: 100,
      delegate: 90,
      enterprise_admin: 80,
      org_admin: 70,
      admin: 60,
      manager: 50,
      editor: 40,
      user: 30,
      viewer: 20,
      guest: 10
    };
    
    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[role] || 0;
    
    return userLevel >= requiredLevel;
  },
  
  /**
   * Check if user has specific permission
   */
  hasPermission(permission) {
    const user = this.getUser();
    if (!user) return false;
    
    // Supra admin has all permissions
    if (this.isGenesis()) return true;
    
    // Check if user has 'all' permission
    if (user.permissions && user.permissions.includes('all')) return true;
    
    return user.permissions && user.permissions.includes(permission);
  },
  
  /**
   * Store auth data
   */
  setAuth(token, user) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    localStorage.setItem('userRole', user.role || 'user');
  },
  
  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem('userRole');
    // Keep genesisInitialized to prevent re-setup
  },
  
  /**
   * Redirect to login if not authenticated
   */
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = '/login.html';
      return false;
    }
    return true;
  },
  
  /**
   * Require Genesis/admin access
   */
  requireGenesis() {
    if (!this.isAuthenticated()) {
      window.location.href = '/login.html';
      return false;
    }
    
    if (!this.isGenesis()) {
      window.location.href = '/dashboard.html';
      return false;
    }
    
    return true;
  },
  
  /**
   * Require specific role
   */
  requireRole(role) {
    if (!this.isAuthenticated()) {
      window.location.href = '/login.html';
      return false;
    }
    
    if (!this.hasRole(role)) {
      window.location.href = '/dashboard.html';
      return false;
    }
    
    return true;
  },
  
  /**
   * Get authorization headers for API calls
   */
  getHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  },
  
  /**
   * Make authenticated API request
   */
  async fetch(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.API_BASE}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      }
    });
    
    // Handle 401 unauthorized
    if (response.status === 401) {
      this.logout();
      window.location.href = '/login.html';
      return null;
    }
    
    return response;
  },
  
  /**
   * Initialize auth check on page load
   */
  init(options = {}) {
    const { requireAuth = true, requireGenesis = false, requireRole = null } = options;
    
    if (requireGenesis) {
      return this.requireGenesis();
    }
    
    if (requireRole) {
      return this.requireRole(requireRole);
    }
    
    if (requireAuth) {
      return this.requireAuth();
    }
    
    return true;
  },
  
  /**
   * Get user display name
   */
  getDisplayName() {
    const user = this.getUser();
    if (!user) return 'Guest';
    
    if (user.firstName) {
      return user.firstName + (user.lastName ? ' ' + user.lastName : '');
    }
    
    return user.email?.split('@')[0] || 'User';
  },
  
  /**
   * Get user initials
   */
  getInitials() {
    const user = this.getUser();
    if (!user) return '?';
    
    if (user.firstName && user.lastName) {
      return (user.firstName[0] + user.lastName[0]).toUpperCase();
    }
    
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    
    return 'U';
  }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Auth;
}

// Make available globally
window.Auth = Auth;
