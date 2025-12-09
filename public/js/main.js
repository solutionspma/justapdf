/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MOD PDF - MAIN JAVASCRIPT
 * ═══════════════════════════════════════════════════════════════════════════════
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all components
  initNavigation();
  initSearch();
  initAnimations();
  initPricingToggle();
});

/**
 * Navigation scroll effects
 */
function initNavigation() {
  const nav = document.querySelector('.nav');
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
      nav.classList.add('nav-scrolled');
    } else {
      nav.classList.remove('nav-scrolled');
    }
    
    lastScroll = currentScroll;
  });
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

/**
 * Search functionality
 */
function initSearch() {
  const searchInput = document.querySelector('.search-input');
  const searchBtn = document.querySelector('.search-bar .btn');
  
  if (!searchInput) return;
  
  const tools = [
    { name: 'Edit PDF', keywords: ['edit', 'modify', 'change', 'text'] },
    { name: 'Merge PDF', keywords: ['merge', 'combine', 'join'] },
    { name: 'Split PDF', keywords: ['split', 'separate', 'extract'] },
    { name: 'Compress', keywords: ['compress', 'reduce', 'size', 'small'] },
    { name: 'Convert', keywords: ['convert', 'word', 'excel', 'jpg', 'png'] },
    { name: 'E-Sign', keywords: ['sign', 'signature', 'esign'] },
    { name: 'Encrypt', keywords: ['encrypt', 'password', 'protect', 'secure'] },
    { name: 'Unlock', keywords: ['unlock', 'remove', 'password'] },
    { name: 'AI Contract', keywords: ['ai', 'contract', 'generate', 'create'] },
    { name: 'Blockchain', keywords: ['blockchain', 'token', 'verify'] },
    { name: 'OCR', keywords: ['ocr', 'text', 'recognize', 'scan'] },
    { name: 'Watermark', keywords: ['watermark', 'stamp', 'brand'] }
  ];
  
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });
  
  searchBtn.addEventListener('click', performSearch);
  
  function performSearch() {
    const query = searchInput.value.toLowerCase().trim();
    if (!query) return;
    
    const results = tools.filter(tool => 
      tool.name.toLowerCase().includes(query) ||
      tool.keywords.some(k => k.includes(query))
    );
    
    if (results.length > 0) {
      // Scroll to tools section
      document.querySelector('#tools').scrollIntoView({ behavior: 'smooth' });
      
      // Highlight matching tools
      setTimeout(() => {
        document.querySelectorAll('.tool-card').forEach(card => {
          const toolName = card.querySelector('h4').textContent;
          const isMatch = results.some(r => r.name === toolName);
          
          if (isMatch) {
            card.style.transform = 'scale(1.05)';
            card.style.borderColor = 'var(--primary)';
            setTimeout(() => {
              card.style.transform = '';
              card.style.borderColor = '';
            }, 2000);
          }
        });
      }, 500);
    }
  }
}

/**
 * Scroll animations
 */
function initAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe elements for animation
  document.querySelectorAll('.feature-card, .tool-card, .pricing-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
  
  // Add animation class styles
  const style = document.createElement('style');
  style.textContent = `
    .animate-in {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Pricing toggle (monthly/yearly)
 */
function initPricingToggle() {
  // Future implementation for billing period toggle
}

/**
 * Tool card interactions
 */
document.querySelectorAll('.tool-card').forEach(card => {
  card.addEventListener('click', () => {
    const toolName = card.querySelector('h4').textContent;
    // Navigate to tool or open modal
    console.log(`Tool selected: ${toolName}`);
    
    // For demo, show alert
    // In production, this would open the tool interface
    window.location.href = `login.html?tool=${encodeURIComponent(toolName)}`;
  });
});

/**
 * Feature card hover effects
 */
document.querySelectorAll('.feature-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    const icon = card.querySelector('.feature-icon');
    if (icon) {
      icon.style.transform = 'scale(1.1) rotate(5deg)';
    }
  });
  
  card.addEventListener('mouseleave', () => {
    const icon = card.querySelector('.feature-icon');
    if (icon) {
      icon.style.transform = '';
    }
  });
});

/**
 * Stats counter animation
 */
function animateStats() {
  const stats = document.querySelectorAll('.hero-stat-value');
  
  stats.forEach(stat => {
    const value = stat.textContent;
    if (/^\d+/.test(value)) {
      const num = parseInt(value);
      const suffix = value.replace(/^\d+/, '');
      let current = 0;
      const increment = num / 30;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= num) {
          current = num;
          clearInterval(timer);
        }
        stat.textContent = Math.floor(current) + suffix;
      }, 50);
    }
  });
}

// Run stats animation when hero is visible
const heroObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateStats();
      heroObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const hero = document.querySelector('.hero');
if (hero) {
  heroObserver.observe(hero);
}
