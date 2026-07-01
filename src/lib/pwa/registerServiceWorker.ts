type ServiceWorkerUpdater = () => void;

interface RegisterServiceWorkerOptions {
  onUpdateReady: (update: ServiceWorkerUpdater) => void;
}

const isProduction = import.meta.env.PROD;

export const registerServiceWorker = async ({ onUpdateReady }: RegisterServiceWorkerOptions) => {
  if (!isProduction || !('serviceWorker' in navigator)) {
    return null;
  }

  const registration = await navigator.serviceWorker.register('./sw.js', { scope: './' });

  registration.addEventListener('updatefound', () => {
    const worker = registration.installing;
    if (!worker) return;

    worker.addEventListener('statechange', () => {
      const hasExistingController = Boolean(navigator.serviceWorker.controller);
      if (worker.state === 'installed' && hasExistingController) {
        onUpdateReady(() => worker.postMessage({ type: 'SKIP_WAITING' }));
      }
    });
  });

  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      registration.update();
    }
  });

  return registration;
};
