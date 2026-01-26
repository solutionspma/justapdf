/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MOD PDF - DATABASE CONNECTION
 * Supabase client and database utilities
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { createClient } from '@supabase/supabase-js';
import admin from 'firebase-admin';

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY;
const FIREBASE_STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET;
const FIREBASE_SERVICE_ACCOUNT_JSON = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

// Validate required environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  if (!FIREBASE_ENABLED) {
    console.warn('⚠️  Database credentials not configured. Database features will be limited.');
  }
}

let firestore = null;
let firebaseBucket = null;
const FIREBASE_ENABLED = !!(
  FIREBASE_PROJECT_ID ||
  FIREBASE_SERVICE_ACCOUNT_JSON ||
  (FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY)
);

if (FIREBASE_ENABLED) {
  try {
    const credential = FIREBASE_SERVICE_ACCOUNT_JSON
      ? admin.credential.cert(JSON.parse(FIREBASE_SERVICE_ACCOUNT_JSON))
      : (FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY)
        ? admin.credential.cert({
            projectId: FIREBASE_PROJECT_ID,
            clientEmail: FIREBASE_CLIENT_EMAIL,
            privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
          })
        : admin.credential.applicationDefault();

    admin.initializeApp({
      credential,
      projectId: FIREBASE_PROJECT_ID,
      storageBucket: FIREBASE_STORAGE_BUCKET
    });

    firestore = admin.firestore();
    if (FIREBASE_STORAGE_BUCKET) {
      firebaseBucket = admin.storage().bucket(FIREBASE_STORAGE_BUCKET);
    }
  } catch (error) {
    console.warn('⚠️  Firebase initialization failed:', error.message);
  }
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

export const firebase = {
  enabled: FIREBASE_ENABLED && !!firestore,
  firestore,
  bucket: firebaseBucket
};

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
    if (firebase.enabled) {
      console.log('✅ Firebase initialized (no bucket provisioning required)');
      return true;
    }

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
    if (firebase.enabled) {
      await firebase.firestore.collection('_health').limit(1).get();
      const latency = Date.now() - start;
      return {
        healthy: true,
        latency,
        timestamp: new Date().toISOString(),
        provider: 'firebase'
      };
    }

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
    if (firebase.enabled) {
      let query = firebase.firestore.collection(table);
      for (const [key, value] of Object.entries(conditions)) {
        query = query.where(key, '==', value);
      }
      const snapshot = await query.limit(1).get();
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }

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
    if (firebase.enabled) {
      let query = firebase.firestore.collection(table);
      for (const [key, value] of Object.entries(conditions)) {
        if (Array.isArray(value)) {
          query = query.where(key, 'in', value.slice(0, 10));
        } else {
          query = query.where(key, '==', value);
        }
      }
      if (orderBy) {
        const [column, direction] = orderBy.split(':');
        query = query.orderBy(column, direction === 'desc' ? 'desc' : 'asc');
      }
      if (offset) query = query.offset(offset);
      if (limit) query = query.limit(limit);
      const snapshot = await query.get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }

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
    if (firebase.enabled) {
      const id = data.id || admin.firestore().collection(table).doc().id;
      const record = { ...data, id };
      await firebase.firestore.collection(table).doc(id).set(record);
      return record;
    }

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
    if (firebase.enabled) {
      if (conditions.id) {
        await firebase.firestore.collection(table).doc(conditions.id).update(data);
        const doc = await firebase.firestore.collection(table).doc(conditions.id).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
      }

      let query = firebase.firestore.collection(table);
      for (const [key, value] of Object.entries(conditions)) {
        query = query.where(key, '==', value);
      }
      const snapshot = await query.limit(1).get();
      if (snapshot.empty) return null;
      const docRef = snapshot.docs[0].ref;
      await docRef.update(data);
      const updated = await docRef.get();
      return { id: updated.id, ...updated.data() };
    }

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
    if (firebase.enabled) {
      if (conditions.id) {
        await firebase.firestore.collection(table).doc(conditions.id).delete();
        return true;
      }
      let query = firebase.firestore.collection(table);
      for (const [key, value] of Object.entries(conditions)) {
        query = query.where(key, '==', value);
      }
      const snapshot = await query.get();
      const batch = firebase.firestore.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      return true;
    }

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
    if (firebase.enabled) {
      let query = firebase.firestore.collection(table);
      for (const [key, value] of Object.entries(conditions)) {
        query = query.where(key, '==', value);
      }
      const snapshot = await query.get();
      return snapshot.size;
    }

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
    if (firebase.enabled) {
      if (!firebase.bucket) throw new Error('Firebase storage bucket not configured');
      const fileRef = firebase.bucket.file(path);
      await fileRef.save(file, { contentType, resumable: false });
      return { path };
    }

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
    if (firebase.enabled) {
      if (!firebase.bucket) throw new Error('Firebase storage bucket not configured');
      const [data] = await firebase.bucket.file(path).download();
      return data;
    }

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
    if (firebase.enabled) {
      if (!firebase.bucket) return null;
      return `https://storage.googleapis.com/${firebase.bucket.name}/${path}`;
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  },
  
  /**
   * Create signed URL
   */
  async createSignedUrl(bucket, path, expiresIn = 3600) {
    if (firebase.enabled) {
      if (!firebase.bucket) throw new Error('Firebase storage bucket not configured');
      const [url] = await firebase.bucket.file(path).getSignedUrl({
        action: 'read',
        expires: Date.now() + expiresIn * 1000
      });
      return url;
    }

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
    if (firebase.enabled) {
      if (!firebase.bucket) throw new Error('Firebase storage bucket not configured');
      await Promise.all(pathArray.map((path) => firebase.bucket.file(path).delete()));
      return true;
    }

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
    if (firebase.enabled) {
      if (!firebase.bucket) throw new Error('Firebase storage bucket not configured');
      const [files] = await firebase.bucket.getFiles({ prefix: folder, maxResults: limit });
      return files.map((file) => ({ name: file.name }));
    }

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
  firebase,
  db,
  storage,
  transaction,
  initializeDatabase,
  checkDatabaseHealth,
  STORAGE_BUCKETS
};
