/**
 * Extensão oculta: injeta Google Analytics (gtag) no JupyterLab após o login.
 * Sem menus, comandos, widgets ou schema de Settings.
 *
 * Privacidade:
 * - Diferencia visitantes via client_id do GA (cookie anônimo), sem username.
 * - Não envia paths de notebooks/arquivos — só /user/{user}/lab.
 * - linea_jh_image identifica a imagem (solarsystem, astronomy, …).
 */

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { PageConfig } from '@jupyterlab/coreutils';

const MEASUREMENT_ID = 'G-MGTSETENCM';
const SCRIPT_ID = 'linea-gtag';

/** Path genérico: sem username real e sem /tree/.../arquivo. */
const ANON_PATH = '/user/{user}/lab';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

function imageName(): string {
  const fromConfig = (PageConfig.getOption('linea_jh_image') || '').trim();
  return fromConfig || 'unknown';
}

function loadGtag(): void {
  if (document.getElementById(SCRIPT_ID)) {
    return;
  }

  const lineaJhImage = imageName();
  const anonLocation = window.location.origin + ANON_PATH;

  // Padrão oficial do Google: push do objeto Arguments (não de um Array aninhado).
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };

  window.gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied'
  });

  // Força page_* anonimizados em todos os hits (incl. Enhanced Measurement).
  window.gtag('set', {
    page_location: anonLocation,
    page_path: ANON_PATH,
    page_title: 'JupyterLab',
    linea_jh_image: lineaJhImage
  });

  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, {
    send_page_view: false,
    page_location: anonLocation,
    page_path: ANON_PATH,
    page_title: 'JupyterLab'
  });

  window.gtag('event', 'page_view', {
    page_location: anonLocation,
    page_path: ANON_PATH,
    page_title: 'JupyterLab',
    linea_jh_image: lineaJhImage
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
