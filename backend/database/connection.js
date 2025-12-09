/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MOD PDF - DATABASE CONNECTION
 * Supabase client and database utilities
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate required environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('⚠️  Supabase credentials not configured. Database features will be limited.');
}

// Create Supabase clients
export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false
    }
  }
);

// Admin client with service role key (for server-side operations)
export const supabaseAdmin = SUPABASE_SERVICE_KEY
  ? createClient(
      SUPABASE_URL || 'https://placeholder.supabase.co',
      SUPABASE_SERVICE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : supabase;

// Storage bucket names
export const STORAGE_BUCKETS = {
  CMS: 'cms-content',
  STATIC_MEDIA: 'static-media',
  DOCUMENTS: 'documents',
  SIGNATURES: 'signatures',
  AVATARS: 'avatars',
  THUMBNAILS: 'thumbnails',
  EXPORTS: 'exports'
};

/**
 * Initialize database tables and buckets
 */
export async function initializeDatabase() {
  try {
    console.log('🔧 Initializing database...');
    
    // Create storage buckets if they don't exist
    for (const [name, bucket] of Object.entries(STORAGE_BUCKETS)) {
      try {
        const { error } = await supabaseAdmin.storage.createBucket(bucket, {
          public: bucket === 'static-media' || bucket === 'avatars',
          fileSizeLimit: bucket === 'documents' ? 100 * 1024 * 1024 : 10 * 1024 * 1024 // 100MB for docs, 10MB others
        });
        
        if (error && !error.message.includes('already exists')) {
          console.warn(`⚠️  Could not create bucket ${bucket}:`, error.message);
        }
      } catch (e) {
        // Bucket might already exist
      }
    }
    
    console.log('✅ Database initialized');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
}

/**
 * Database health check
 */
export async function checkDatabaseHealth() {
  try {
    const start = Date.now();
    
    // Simple query to check connection
    const { error } = await supabase.from('users').select('count').limit(1);
    
    const latency = Date.now() - start;
    
    if (error && !error.message.includes('does not exist')) {
      return {
        healthy: false,
        latency,
        error: error.message
      };
    }
    
    return {
      healthy: true,
      latency,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATABASE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generic CRUD operations
 */
export const db = {
  /**
   * Find one record
   */
  async findOne(table, conditions, select = '*') {
    const query = supabase.from(table).select(select);
    
    for (const [key, value] of Object.entries(conditions)) {
      query.eq(key, value);
    }
    
    const { data, error } = await query.single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },
  
  /**
   * Find multiple records
   */
  async findMany(table, conditions = {}, options = {}) {
    const { select = '*', orderBy, limit, offset } = options;
    let query = supabase.from(table).select(select);
    
    for (const [key, value] of Object.entries(conditions)) {
      if (Array.isArray(value)) {
        query = query.in(key, value);
      } else {
        query = query.eq(key, value);
      }
    }
    
    if (orderBy) {
      const [column, direction] = orderBy.split(':');
      query = query.order(column, { ascending: direction !== 'desc' });
    }
    
    if (limit) query = query.limit(limit);
    if (offset) query = query.range(offset, offset + (limit || 20) - 1);
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },
  
  /**
   * Create a record
   */
  async create(table, data) {
    const { data: created, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return created;
  },
  
  /**
   * Update a record
   */
  async update(table, conditions, data) {
    let query = supabase.from(table).update(data);
    
    for (const [key, value] of Object.entries(conditions)) {
      query = query.eq(key, value);
    }
    
    const { data: updated, error } = await query.select().single();
    
    if (error) throw error;
    return updated;
  },
  
  /**
   * Delete a record
   */
  async delete(table, conditions) {
    let query = supabase.from(table).delete();
    
    for (const [key, value] of Object.entries(conditions)) {
      query = query.eq(key, value);
    }
    
    const { error } = await query;
    
    if (error) throw error;
    return true;
  },
  
  /**
   * Count records
   */
  async count(table, conditions = {}) {
    let query = supabase.from(table).select('*', { count: 'exact', head: true });
    
    for (const [key, value] of Object.entries(conditions)) {
      query = query.eq(key, value);
    }
    
    const { count, error } = await query;
    
    if (error) throw error;
    return count || 0;
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// STORAGE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

export const storage = {
  /**
   * Upload a file
   */
  async upload(bucket, path, file, options = {}) {
    const { contentType, upsert = false } = options;
    
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        upsert
      });
    
    if (error) throw error;
    return data;
  },
  
  /**
   * Download a file
   */
  async download(bucket, path) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);
    
    if (error) throw error;
    return data;
  },
  
  /**
   * Get public URL
   */
  getPublicUrl(bucket, path) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  },
  
  /**
   * Create signed URL
   */
  async createSignedUrl(bucket, path, expiresIn = 3600) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);
    
    if (error) throw error;
    return data.signedUrl;
  },
  
  /**
   * Delete a file
   */
  async delete(bucket, paths) {
    const pathArray = Array.isArray(paths) ? paths : [paths];
    
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove(pathArray);
    
    if (error) throw error;
    return true;
  },
  
  /**
   * List files in a folder
   */
  async list(bucket, folder = '', options = {}) {
    const { limit = 100, offset = 0 } = options;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, { limit, offset });
    
    if (error) throw error;
    return data || [];
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSACTION HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Run operations in a transaction-like manner
 * Note: Supabase doesn't support true transactions via JS client,
 * this is a best-effort implementation
 */
export async function transaction(operations) {
  const results = [];
  const rollbacks = [];
  
  try {
    for (const op of operations) {
      const result = await op.execute();
      results.push(result);
      
      if (op.rollback) {
        rollbacks.unshift(op.rollback);
      }
    }
    
    return { success: true, results };
  } catch (error) {
    // Attempt rollback
    for (const rollback of rollbacks) {
      try {
        await rollback();
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
      }
    }
    
    throw error;
  }
}

export default {
  supabase,
  supabaseAdmin,
  db,
  storage,
  transaction,
  initializeDatabase,
  checkDatabaseHealth,
  STORAGE_BUCKETS
};
