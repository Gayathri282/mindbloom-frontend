'use client';

export interface GoogleUserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

declare global {
  interface Window {
    google?: any;
  }
}

/**
 * Loads the official Google Identity Services script dynamically if not already loaded.
 */
export const loadGoogleScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve();
    if (window.google?.accounts?.id) {
      return resolve();
    }

    const existingScript = document.getElementById('google-gsi-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', (e) => reject(e));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
};

/**
 * Decodes Google JWT Credential returned by Google Identity Services.
 */
export const decodeGoogleJwt = (token: string): GoogleUserProfile | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);

    return {
      id: parsed.sub,
      email: parsed.email,
      name: parsed.name || parsed.given_name || 'Google User',
      picture: parsed.picture, // Google avatar URL
    };
  } catch (err) {
    console.error('Failed to decode Google JWT token:', err);
    return null;
  }
};
