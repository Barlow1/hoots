import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import createEmotionCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { RemixBrowser } from "@remix-run/react";

function hydrate() {
  const emotionCache = createEmotionCache({ key: "css" });

  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <RemixBrowser />
      </StrictMode>
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
