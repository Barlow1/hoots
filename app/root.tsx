import type { Mentor, Profile } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import React, { useEffect } from "react";
import * as gtag from "~/utils/gtags.client";
import { useTheme } from "hooks/useTheme";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { getUser, getUserSession } from "./utils/user.session.server";
// eslint-disable-next-line import/no-cycle
import App from "./_app";
import { getSocialMetas } from "./utils/seo";
import { getDisplayUrl } from "./utils/url";
import tailwindStyleUrls from "./styles/tailwind.css";
import globalStyleUrl from "./styles/global.css";
import ThemeProvider, {
  NonFlashOfWrongThemeEls,
} from "./components/ThemeProvider";
import getThemeSession from "./utils/theme.session.server";
import { H3, Paragraph } from "./components/Typography";

export const meta: MetaFunction = ({ data }) => {
  let requestInfo;
  if (data) {
    ({ requestInfo } = data);
  }
  return {
    charset: "utf-8",
    viewport: "width=device-width,initial-scale=1",
    ...getSocialMetas({ url: getDisplayUrl(requestInfo) }),
  };
};

export type LoaderData = {
  env: {
    API_URL: string;
  };
  user: Profile | null;
  mentorProfile: Mentor | null;
};

export const handle: { id: string } = {
  id: "root",
};

export const loader: LoaderFunction = async ({ request }) => {
  const baseUrl = new URL(request.url).origin;
  const user = await getUser(request);
  const themeSession = await getThemeSession(request);
  const theme = themeSession.getTheme();
  const userSession = await getUserSession(request);
  let mentorProfile = await userSession.getMentorProfile();
  if (user && !mentorProfile) {
    const prisma = new PrismaClient();
    prisma
      .$connect()
      .catch((err) => console.error("Failed to connect to db", err));
    mentorProfile = await prisma.mentor.findUnique({
      where: {
        profileId: user.id,
      },
    });
    userSession.setMentorProfile(mentorProfile);
  }

  const cookies = request.headers.get("Cookie") ?? "";

  return json(
    {
      env: {
        API_URL: baseUrl,
      },
      user,
      cookies,
      mentorProfile,
      theme,
    },
    {
      headers: { "Set-Cookie": await userSession.commit() },
    }
  );
};

export function Root() {
  const data = useLoaderData();
  const { theme } = data;
  return (
    <ThemeProvider suppliedTheme={theme}>
      <Document>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.env = ${JSON.stringify(data.env)}`,
          }}
        />
        <GoogleReCaptchaProvider reCaptchaKey="6LcW9pskAAAAAABkFC8vGQZKPXrsIiXIlWKUDxmQ">
          <App user={data.user}>
            <Outlet />
          </App>
        </GoogleReCaptchaProvider>
      </Document>
    </ThemeProvider>
  );
}

export const links: LinksFunction = () => [
  {
    rel: "icon",
    type: "image/png",
    sizes: "16x16",
    href: "/emblem.png",
  },
  {
    href: "https://use.fontawesome.com/releases/v6.1.1/css/svg-with-js.css",
    rel: "stylesheet",
  },
  { rel: "stylesheet", href: globalStyleUrl },
  { rel: "stylesheet", href: tailwindStyleUrls },
];

function Document({
  children,
  title = "Hoots Mentoring",
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const gaTrackingId = "G-N1KVNXJ313";
  const location = useLocation();
  const [theme] = useTheme();

  useEffect(() => {
    if (gaTrackingId?.length) {
      gtag.pageview(location.pathname, gaTrackingId);
    }
  }, [location]);
  return (
    <html lang="en" className={`${theme}`}>
      <head>
        <Meta />
        <title>{title}</title>
        <Links />
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${gaTrackingId}`}
        />
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
        <NonFlashOfWrongThemeEls ssrTheme={Boolean(theme)} />
      </head>
      <body className="bg-white dark:bg-zinc-900">
        {children}
        <Scripts />
        <ScrollRestoration />
        <div id="hoots-portal" />
      </body>
    </html>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  return (
    <ThemeProvider>
      <Document title={`${caught.status} ${caught.statusText}`}>
        <div>
          <H3 as="h1">This page does not exist...</H3>
          <Paragraph>
            If you think this is an error, please contact support{" "}
            <a href="mailto:help@inhoots.com">help@inhoots.com</a>
          </Paragraph>
        </div>
      </Document>
    </ThemeProvider>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <ThemeProvider>
      <Document title="Error!">
        <div>
          <H3 as="h1">
            There was an error:
            {error.message}
          </H3>
          <Paragraph>
            Try refreshing the page and if the issue persists, please contact
            support <a href="mailto:help@inhoots.com">help@inhoots.com</a>
          </Paragraph>
        </div>
      </Document>
    </ThemeProvider>
  );
}

export default Root;
