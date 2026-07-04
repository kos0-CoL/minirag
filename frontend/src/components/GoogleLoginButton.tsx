import { useEffect, useRef } from 'react';

interface Props {
  onSuccess: (credential: string) => void;
  onError?: (error: string) => void;
  label?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (el: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default function GoogleLoginButton({ onSuccess, onError, label = 'Continuar con Google' }: Props) {
  const btnRef = useRef<HTMLDivElement>(null);
  const called = useRef(false);

  useEffect(() => {
    if (!window.google || !btnRef.current) {
      console.warn('Google Identity Services not loaded');
      return;
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('VITE_GOOGLE_CLIENT_ID is not configured');
      onError?.('Google Client ID not configured');
      return;
    }

    console.log('Initializing Google Sign-In with Client ID:', clientId.substring(0, 20) + '...');

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (res: any) => {
        console.log('Google callback received:', res ? 'success' : 'empty');
        if (!called.current) {
          called.current = true;
          if (res?.credential) {
            console.log('Credential received, calling onSuccess');
            onSuccess(res.credential);
          } else {
            console.error('No credential in Google response');
            onError?.('No credential received from Google');
          }
        }
      },
      cancel_on_tap_outside: false,
      auto_select: false,
    });

    window.google.accounts.id.renderButton(btnRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: label === 'Continuar con Google' ? 'signin_with' : 'signup_with',
      width: 320,
    });
  }, [onSuccess, onError, label]);

  return <div ref={btnRef} className="flex justify-center" />;
}
