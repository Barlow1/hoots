import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
// eslint-disable-next-line import/no-extraneous-dependencies
import { RemixBrowser } from '@remix-run/react';

function hydrate() {

  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <RemixBrowser />
      </StrictMode>,
    );
  });
}

if (window.requestIdleCallback) {
  window.requestIdleCallback(hydrate);
} else {
  // Safari doesn't support requestIdleCallback
  // https://caniuse.com/requestidlecallback
  window.setTimeout(hydrate, 1);
}
