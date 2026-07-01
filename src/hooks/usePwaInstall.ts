import { useEffect, useMemo, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const isStandalone = () => {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || navigatorWithStandalone.standalone === true;
};

const isIosDevice = () => {
  const platform = navigator.platform.toLowerCase();
  const userAgent = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent) || (platform === 'macintel' && navigator.maxTouchPoints > 1);
};

export const usePwaInstall = () => {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const isIos = useMemo(isIosDevice, []);

  useEffect(() => {
    setInstalled(isStandalone());

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      localStorage.setItem('pdf-to-jpg-installed', 'true');
      setInstalled(true);
      setPromptEvent(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const install = async () => {
    if (!promptEvent) return;

    await promptEvent.prompt();
    await promptEvent.userChoice;
    setPromptEvent(null);
  };

  return {
    canInstall: !installed && (Boolean(promptEvent) || isIos),
    install,
    isIos,
  };
};
