import { registerSW } from 'virtual:pwa-register';

export function registrarServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;
  const atualizarSW = registerSW({
    immediate: true,
    onRegisteredSW(_url, registration) {
      registration?.update();
    },
  });
  void atualizarSW;
}
