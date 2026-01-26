/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * JUSTAPDF - FIREBASE WEB CLIENT
 * Initializes Firebase app + Analytics (if supported).
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAnalytics, isSupported } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDnc0Ls0P0d3lqNzAQp-oS4iK86ReWYv0o',
  authDomain: 'justapdf-b0f05.firebaseapp.com',
  projectId: 'justapdf-b0f05',
  storageBucket: 'justapdf-b0f05.firebasestorage.app',
  messagingSenderId: '330517182744',
  appId: '1:330517182744:web:fd50b081a5882e9175466d',
  measurementId: 'G-DFXLJL7KPN'
};

const app = initializeApp(firebaseConfig);
let analytics = null;

isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

window.Firebase = {
  app,
  analytics,
  config: firebaseConfig
};

