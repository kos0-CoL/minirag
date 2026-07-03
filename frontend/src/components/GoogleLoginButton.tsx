import { useEffect, useRef } from 'react';

interface Props {
  onSuccess: (credential: string) => void;
  onError?: () => void;
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
    if (!window.google || !btnRef.current) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: (res: any) => {
        if (!called.current) {
          called.current = true;
          onSuccess(res.credential);
        }
      },
      cancel_on_tap_outside: false,
    });

    window.google.accounts.id.renderButton(btnRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: label === 'Continuar con Google' ? 'signin_with' : 'signup_with',
      width: 320,
    });
  }, []);

  return <div ref={btnRef} className="flex justify-center" />;
}
