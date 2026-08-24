import {HydratedRouter} from 'react-router/dom';
import {startTransition, StrictMode} from 'react';
import {hydrateRoot} from 'react-dom/client';
import {NonceProvider} from '@shopify/hydrogen';

// Shopify Analytics usa Object.defineProperty con configurable:false.
// En dev (Strict Mode, HMR) el useEffect corre dos veces y falla al redefinirlo.
// Hacemos la propiedad configurable antes de que React monte el árbol.
try {
  if (typeof window !== 'undefined' && (window as any).Shopify !== undefined) {
    Object.defineProperty(window, 'Shopify', {
      configurable: true,
      writable: true,
      value: (window as any).Shopify,
    });
  }
} catch (_) {}

if (!window.location.origin.includes('webcache.googleusercontent.com')) {
  startTransition(() => {
    const existingNonce =
      document.querySelector<HTMLScriptElement>('script[nonce]')?.nonce;

    hydrateRoot(
      document,
      <StrictMode>
        <NonceProvider value={existingNonce}>
          <HydratedRouter />
        </NonceProvider>
      </StrictMode>,
    );
  });
}
