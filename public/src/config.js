const env = window.__ENV__ || {};

export const apiConfig = {
  baseUrl: '/api',
  get nativeEditEngine() {
    return window.__ENV__?.NATIVE_EDIT_ENGINE || env.NATIVE_EDIT_ENGINE || '';
  }
};
