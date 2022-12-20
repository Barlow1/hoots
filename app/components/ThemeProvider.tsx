import type { ReactNode } from "react";
import React, {
  useState,
  Dispatch,
  createContext,
  SetStateAction,
} from "react";
import { useFetcher } from "@remix-run/react";
import useTheme from "hooks/useTheme";

// eslint-disable-next-line no-shadow
export enum Theme {
  DARK = "dark",
  LIGHT = "light",
}

type ThemeProviderType = {
  children: ReactNode;
  suppliedTheme?: Theme | undefined;
};

type ThemeContextType =
  | [
      theme: Theme | undefined,
      setTheme: Dispatch<SetStateAction<Theme | undefined>>
    ]
  | undefined;

export const themes: Array<Theme> = Object.values(Theme);

export const ThemeContext = createContext<ThemeContextType>(undefined);

export const isTheme = (value: unknown): value is Theme =>
  typeof value === "string" && themes.includes(value as Theme);

const prefersLightMQ = "(prefers-color-scheme: light)";
const getPreferredTheme = () =>
  window.matchMedia(prefersLightMQ).matches ? Theme.LIGHT : Theme.DARK;

const clientThemeCode = `
// hi there dear reader 👋
// this is how I make certain we avoid a flash of the wrong theme. If you select
// a theme, then I'll know what you want in the future and you'll not see this
// script anymore.
;(() => {
  const theme = window.matchMedia(${JSON.stringify(prefersLightMQ)}).matches
    ? 'light'
    : 'dark';
  
  const cl = document.documentElement.classList;
  
  const themeAlreadyApplied = cl.contains('light') || cl.contains('dark');
  if (themeAlreadyApplied) {
    // this script shouldn't exist if the theme is already applied!
    console.warn(
      "Hi there, could you let Christian know you're seeing this message? Thanks!",
    );
  } else {
    cl.add(theme);
  }
  
  // the <dark-mode> and <light-mode> approach won't work for meta tags,
  // so we have to do it manually.
  const meta = document.querySelector('meta[name=color-scheme]');
  if (meta) {
    if (theme === 'dark') {
      meta.content = 'dark light';
    } else if (theme === 'light') {
      meta.content = 'light dark';
    }
  } else {
    console.warn(
      "Hey, could you let Christian know you're seeing this message? Thanks!",
    );
  }
})();
`;

export function NonFlashOfWrongThemeEls({ ssrTheme }: { ssrTheme: boolean }) {
  const [theme] = useTheme();
  return (
    <>
      {/*
        On the server, "theme" might be `null`, so clientThemeCode ensures that
        this is correct before hydration.
      */}
      <meta
        name="color-scheme"
        content={theme === "light" ? "light dark" : "dark light"}
      />
      {/*
        If we know what the theme is from the server then we don't need
        to do fancy tricks prior to hydration to make things match.
      */}
      {ssrTheme ? null : (
        <script
          // NOTE: we cannot use type="module" because that automatically makes
          // the script "defer". That doesn't work for us because we need
          // this script to run synchronously before the rest of the document
          // is finished loading.
          dangerouslySetInnerHTML={{ __html: clientThemeCode }}
        />
      )}
    </>
  );
}

function ThemeProvider({
  children,
  suppliedTheme,
}: ThemeProviderType): JSX.Element {
  const [theme, setTheme] = useState<Theme | undefined>(() => {
    if (suppliedTheme) {
      if (themes.includes(suppliedTheme)) return suppliedTheme;
      return undefined;
    }

    if (typeof window !== "object") return undefined;

    return getPreferredTheme();
  });

  const persistTheme = useFetcher();

  const persistThemeRef = React.useRef(persistTheme);
  React.useEffect(() => {
    persistThemeRef.current = persistTheme;
  }, [persistTheme]);

  const mountRun = React.useRef(false);

  React.useEffect(() => {
    if (!mountRun.current) {
      mountRun.current = true;
      return;
    }
    if (!theme) return;

    persistThemeRef.current.submit(
      { theme },
      { action: "actions/set-theme", method: "post" }
    );
  }, [theme]);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(prefersLightMQ);
    const handleChange = () => {
      setTheme(mediaQuery.matches ? Theme.LIGHT : Theme.DARK);
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const ThemeContextProvider = ThemeContext.Provider;
  return (
    <ThemeContextProvider value={[theme, setTheme]}>
      {children}
    </ThemeContextProvider>
  );
}

export default ThemeProvider;
