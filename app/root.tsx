import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { withEmotionCache } from "@emotion/react";
import { Profile } from "@prisma/client";
import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import React, { useContext, useEffect } from "react";
import { ClientStyleContext, ServerStyleContext } from "./context";
import { getUser } from "./utils/user.session";
import App from "./_app";
import * as gtag from "~/utils/gtags.client";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Hoots",
  viewport: "width=device-width,initial-scale=1",
});

const colors = {
  brand: {
    900: "#6D29EF",
    500: "#805ad5",
    200: "#9f7aea",
  },
  buttons: {
    fail: "#FC8181",
    disabled: "#cbd5e0",
  },
};

export type LoaderData = {
  env: {
    DATABASE_URL: string;
    API_URL: string;
  };
  user: Profile | null;
};

export const handle: { id: string } = {
  id: "root",
};

const theme = extendTheme({ colors });
export const loader: LoaderFunction = async ({ request }) => {
  const baseUrl = new URL(request.url).origin;
  const user = await getUser(request);
  return json({
    env: {
      DATABASE_URL: process.env.DATABASE_URL,
      API_URL: baseUrl,
    },
    user,
  });
};

export const Root = withEmotionCache(
  ({ children }: { children: React.ReactNode }, emotionCache) => {
    const serverStyleData = useContext(ServerStyleContext);
    const clientStyleData = useContext(ClientStyleContext);

    // Only executed on client
    useEffect(() => {
      // re-link sheet container
      emotionCache.sheet.container = document.head;
      // re-inject tags
      const tags = emotionCache.sheet.tags;
      emotionCache.sheet.flush();
      tags.forEach((tag) => {
        (emotionCache.sheet as any)._insertTag(tag);
      });
      // reset cache to reapply global styles
      clientStyleData?.reset();
    }, []);

    const data = useLoaderData();
    const gaTrackingId = "G-N1KVNXJ313";
    const location = useLocation();

    useEffect(() => {
      if (gaTrackingId?.length) {
        gtag.pageview(location.pathname, gaTrackingId);
      }
    }, [location]);
    return (
      <html lang="en">
        <head>
          {/* <!-- Global site tag (gtag.js) - Google Analytics --> */}
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${gaTrackingId}`}
          ></script>
          <script
            async
            id="gtag-init"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaTrackingId}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
          <Meta />
          <Links />
          <link rel="icon" type="image/png" sizes="16x16" href="/emblem.png" />
          {serverStyleData?.map(({ key, ids, css }) => (
            <style
              key={key}
              data-emotion={`${key} ${ids.join(" ")}`}
              dangerouslySetInnerHTML={{ __html: css }}
            />
          ))}
          <link
            href="https://use.fontawesome.com/releases/v6.1.1/css/svg-with-js.css"
            rel="stylesheet"
          ></link>
        </head>
        <body>
          {children}
          <ChakraProvider theme={theme} portalZIndex={40}>
            <App user={data.user}>
              <Outlet />
              <ScrollRestoration />
              <script
                dangerouslySetInnerHTML={{
                  __html: `window.env = ${JSON.stringify(data.env)}`,
                }}
              />
              <Scripts />
              <LiveReload />
            </App>
          </ChakraProvider>
        </body>
      </html>
    );
  }
);

export default Root;
