import { useEffect, useState } from 'react';
import { registerServiceWorker } from '@/lib/pwa/registerServiceWorker';

type ServiceWorkerUpdater = () => void;

export const useServiceWorkerUpdate = () => {
  const [updateApp, setUpdateApp] = useState<ServiceWorkerUpdater | null>(null);

  useEffect(() => {
    registerServiceWorker({
      onUpdateReady: (update) => setUpdateApp(() => update),
    }).catch((error) => {
      console.error('Service worker registration failed', error);
    });
  }, []);

  return { updateAvailable: Boolean(updateApp), updateApp };
};
