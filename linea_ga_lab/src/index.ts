/**
 * Extensão oculta: injeta Google Analytics (gtag) no JupyterLab após o login.
 * Sem menus, comandos, widgets ou schema de Settings.
 */

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

const MEASUREMENT_ID = 'G-MGTSETENCM';
const SCRIPT_ID = 'linea-gtag';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

function sanitizedPath(): string {
  return window.location.pathname.replace(/^\/user\/[^/]+/, '/user/{user}');
}

function loadGtag(): void {
  if (document.getElementById(SCRIPT_ID)) {
    return;
  }

  // Padrão oficial do Google: push do objeto Arguments (não de um Array aninhado).
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };

  // Sem consent explícito, o gtag pode enfileirar eventos e não disparar /g/collect.
  window.gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied'
  });

  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, { send_page_view: false });

  const path = sanitizedPath();
  window.gtag('event', 'page_view', {
    page_location: window.location.origin + path,
    page_path: path,
    page_title: 'JupyterLab'
  });
}

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'linea-ga:plugin',
  description: 'Google Analytics silencioso para JupyterLab (LIneA).',
  autoStart: true,
  activate: (_app: JupyterFrontEnd) => {
    loadGtag();
  }
};

export default plugin;
