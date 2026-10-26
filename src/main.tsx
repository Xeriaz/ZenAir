import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Fix iOS WebKit PWA top-edge progressive blur glitch on standalone launch
if (typeof window !== 'undefined') {
  const fixIosPwaBlur = () => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;

    if (!isStandalone) return;

    // Trigger an imperceptible transition that resets WebKit's status bar sampler
    const cover = document.createElement('div');
    cover.style.cssText =
      'position:fixed;inset:0;z-index:2147483646;background:rgba(9,13,22,0.01);pointer-events:none;';
    const panel = document.createElement('div');
    panel.style.cssText =
      'position:fixed;top:0;right:0;bottom:0;width:90%;height:100%;z-index:2147483647;background:rgba(9,13,22,0.01);pointer-events:none;transform:translateX(110%);transition:transform 0.25s;';
    document.body.append(cover, panel);

    void panel.offsetWidth;

    requestAnimationFrame(() => {
      panel.style.transform = 'translateX(0%)';
      setTimeout(() => {
        cover.remove();
        panel.remove();
      }, 350);
    });
  };

  if (document.readyState === 'complete') {
    fixIosPwaBlur();
  } else {
    window.addEventListener('load', fixIosPwaBlur);
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find root element');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
