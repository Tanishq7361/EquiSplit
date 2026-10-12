import React, { useEffect, useRef, useState } from 'react';
import styles from './GoogleLoginButton.module.css';

export default function GoogleLoginButton({ onSuccess, onError, text = 'Continue with Google', isSignUp = false, disabled = false }) {
  const containerRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [configError, setConfigError] = useState('');

  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  // Load GIS script dynamically if not present
  useEffect(() => {
    if (window.google?.accounts?.id) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      console.warn('Failed to load Google Identity Services script');
    };
    document.body.appendChild(script);

    return () => {
      // Keep script in document cache
    };
  }, []);

  // Initialize and render Google button
  useEffect(() => {
    if (!scriptLoaded || !window.google?.accounts?.id || !containerRef.current) return;

    if (!clientId) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response?.credential) {
            onSuccess(response.credential);
          } else {
            onError?.('No credential returned from Google');
          }
        },
      });

      // Render the official GIS button inside container
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: isSignUp ? 'signup_with' : 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 380,
      });
    } catch (err) {
      console.error('Failed to initialize Google Sign-In:', err);
    }
  }, [scriptLoaded, clientId, isSignUp, onSuccess, onError]);

  const handleCustomClick = () => {
    if (!clientId) {
      setConfigError('Google Client ID not configured. Please set REACT_APP_GOOGLE_CLIENT_ID in frontend/.env');
      onError?.('Google Client ID not configured. Please set REACT_APP_GOOGLE_CLIENT_ID in frontend/.env');
      return;
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('OneTap prompt not displayed or skipped');
        }
      });
    }
  };

  return (
    <div className={styles.googleButtonWrapper}>
      {/* If Client ID is set and script loaded, official GIS button renders here */}
      {clientId && scriptLoaded ? (
        <div ref={containerRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }} />
      ) : (
        <button
          type="button"
          className={styles.googleBtn}
          onClick={handleCustomClick}
          disabled={disabled}
        >
          <svg className={styles.googleIcon} viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>{text}</span>
        </button>
      )}

      {configError && <p className={styles.configNotice}>{configError}</p>}
    </div>
  );
}
