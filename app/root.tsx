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
} from "@remix-run/react";
import React, { useContext, useEffect } from "react";
import { ClientStyleContext, ServerStyleContext } from "./context";
import { getUser } from "./utils/user.session";
import App from "./_app";

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
    DEPLOY_PRIME_URL: string;
  };
  user: Profile | null;
};

export const handle: { id: string } = {
  id: "root",
};

const theme = extendTheme({ colors });
export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  return json({
    env: {
      DATABASE_URL: process.env.DATABASE_URL,
      DEPLOY_PRIME_URL: process.env.DEPLOY_PRIME_URL,
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
    return (
      <html lang="en">
        <head>
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
