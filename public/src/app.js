import Home from './pages/home.js';
import Editor from './pages/editor.js';
import Pricing from './pages/pricing.js';
import Account from './pages/account.js';
import Login from './pages/login.js';
import Register from './pages/register.js';

const routes = {
  '/': Home,
  '/editor': Editor,
  '/pricing': Pricing,
  '/account': Account,
  '/login': Login,
  '/register': Register
};

export function render(path = '/') {
  const view = routes[path] || Home;
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = view();
  window.scrollTo(0, 0);
}
