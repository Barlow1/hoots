import type { Profile } from "@prisma/client";
import { Authenticator } from "remix-auth";
import { GoogleStrategy, SocialsProvider } from "remix-auth-socials";
import { sessionStorage } from "~/utils/user.session.server";
import { oauth } from "./profile.server";

// Create an instance of the authenticator
export const authenticator = new Authenticator<Partial<Profile>>(
  sessionStorage,
  {
    sessionKey: "user",
  }
);
// You may specify a <User> type which the strategies will return (this will be stored in the session)
// export let authenticator = new Authenticator<User>(sessionStorage, { sessionKey: '_session' });

const getCallback = (provider: SocialsProvider) => `/auth/${provider}/callback`;

authenticator.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      callbackURL: getCallback(SocialsProvider.GOOGLE),
    },
    async ({ profile, context }) => {
      const baseUrl = context?.baseUrl as string;

      const values = {
        firstName: profile._json.given_name,
        lastName: profile._json.family_name,
        email: profile._json.email,
        img: profile._json.picture,
        verified: profile._json.email_verified,
        password: profile._json.email,
      };
      return oauth({ values, baseUrl });
    }
  )
);
