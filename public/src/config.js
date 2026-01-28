const env = window.__ENV__ || {};

export const firebaseConfig = {
  apiKey: env.FIREBASE_API_KEY || 'AIzaSyDnc0Ls0P0d3lqNzAQp-oS4iK86ReWYv0o',
  authDomain: env.FIREBASE_AUTH_DOMAIN || 'justapdf-b0f05.firebaseapp.com',
  projectId: env.FIREBASE_PROJECT_ID || 'justapdf-b0f05',
  storageBucket: env.FIREBASE_STORAGE_BUCKET || 'justapdf-b0f05.firebasestorage.app',
  messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID || '330517182744',
  appId: env.FIREBASE_APP_ID || '1:330517182744:web:fd50b081a5882e9175466d',
  measurementId: env.FIREBASE_MEASUREMENT_ID || 'G-DFXLJL7KPN'
};

export const supabaseConfig = {
  url: '',
  anonKey: ''
};

export const apiConfig = {
  baseUrl: '/api'
};
