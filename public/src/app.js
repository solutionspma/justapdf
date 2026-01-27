import Home from './pages/home.js';
import Editor, { mountEditor } from './pages/editor.js';
import Pricing from './pages/pricing.js';
import Account, { mountAccount } from './pages/account.js';
import Login, { mountLogin } from './pages/login.js';
import Register, { mountRegister } from './pages/register.js';
import { initThemeControls } from './ui/themeControls.js';

const routes = {
  '/': { render: Home },
  '/editor': { render: Editor, mount: mountEditor },
  '/pricing': { render: Pricing },
  '/account': { render: Account, mount: mountAccount },
  '/login': { render: Login, mount: mountLogin },
  '/register': { render: Register, mount: mountRegister }
};

export function render(path = '/') {
  const route = routes[path] || routes['/'];
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = route.render();
  window.scrollTo(0, 0);
  initThemeControls();
  if (route.mount) {
    route.mount();
  }
}
