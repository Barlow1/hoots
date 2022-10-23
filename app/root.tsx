import {
  Box,
  ChakraProvider,
  ColorModeScript,
  cookieStorageManagerSSR,
  extendTheme,
  Heading,
  Link,
} from "@chakra-ui/react";
import { withEmotionCache } from "@emotion/react";
import { Profile } from "@prisma/client";
import {
  json,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import React, { useContext, useEffect } from "react";
import { ClientStyleContext, ServerStyleContext } from "./context";
import { getSession, getUser } from "./utils/user.session";
import App from "./_app";
import * as gtag from "~/utils/gtags.client";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
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

// 2. Add your color mode config
const config = {
  initialColorMode: "system",
  useSystemColorMode: true,
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

const theme = extendTheme({ colors, config });
export const loader: LoaderFunction = async ({ request }) => {
  const baseUrl = new URL(request.url).origin;
  const user = await getUser(request);
  const cookies = request.headers.get("Cookie") ?? "";

  return json({
    env: {
      DATABASE_URL: process.env.DATABASE_URL,
      API_URL: baseUrl,
    },
    user,
    cookies,
  });
};

export const Root = () => {
  const data = useLoaderData();
  return (
    <Document>
      <ChakraProvider
        theme={theme}
        portalZIndex={40}
        colorModeManager={cookieStorageManagerSSR(data.cookies)}
      >
        <App user={data.user}>
          <Outlet />
        </App>
      </ChakraProvider>
    </Document>
  );
};

export const links: LinksFunction = () => {
  return [
    { rel: "icon", type: "image/png", sizes: "16x16", href: "/emblem.png" },
    {
      href: "https://use.fontawesome.com/releases/v6.1.1/css/svg-with-js.css",
      rel: "stylesheet",
    },
  ];
};

function Document({
  children,
  title = "Hoots Mentoring",
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const gaTrackingId = "G-N1KVNXJ313";
  const location = useLocation();
  const data = useLoaderData();

  useEffect(() => {
    if (gaTrackingId?.length) {
      gtag.pageview(location.pathname, gaTrackingId);
    }
  }, [location]);
  return (
    <html lang="en">
      <head>
        <Meta />
        <title>{title}</title>
        <Links />
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
        <script
          dangerouslySetInnerHTML={{
            __html: `window.env = ${JSON.stringify(data.env)}`,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
        <ScrollRestoration />
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      </body>
    </html>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  return (
    <Document title={`${caught.status} ${caught.statusText}`}>
      <ChakraProvider theme={theme} portalZIndex={40}>
        <Box>
          <Heading as="h1" bg="purple.600">
            [CatchBoundary]: {caught.status} {caught.statusText}
          </Heading>
        </Box>
      </ChakraProvider>
    </Document>
  );
}

// How ChakraProvider should be used on ErrorBoundary
export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Document title="Error!">
      <ChakraProvider theme={theme} portalZIndex={40}>
        <Box>
          <Heading as="h1">
            There was an error: {error.message}
            Please contact support{" "}
            <Link href="mailto:help@inhoots.com">help@inhoots.com</Link>
          </Heading>
        </Box>
      </ChakraProvider>
    </Document>
  );
}

export default Root;
