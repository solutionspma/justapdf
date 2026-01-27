export async function getToken() {
  try {
    const { auth } = await import('./firebase.js');
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  } catch (error) {
    console.error('Failed to resolve auth token', error);
    return null;
  }
}

export async function getCurrentUser() {
  const { auth } = await import('./firebase.js');
  return auth.currentUser;
}

export async function onAuthChange(handler) {
  const { auth, onAuthStateChanged } = await import('./firebase.js');
  return onAuthStateChanged(auth, handler);
}
