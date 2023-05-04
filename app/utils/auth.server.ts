import type { Profile } from "@prisma/client";
import { Authenticator } from "remix-auth";
import {
  GitHubStrategy,
  GoogleStrategy,
  SocialsProvider,
  TwitterStrategy,
} from "remix-auth-socials";
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

authenticator.use(
  new TwitterStrategy(
    {
      clientID: process.env.TWITTER_CLIENT_ID ?? "",
      clientSecret: process.env.TWITTER_CLIENT_SECRET ?? "",
      callbackURL: getCallback(SocialsProvider.TWITTER),
      includeEmail: true, // Optional parameter. Default: false.
      /** TODO: add back once remix-social-auth is updated */
      // alwaysReauthorize: false // otherwise, ask for permission every time
    },
    async ({ profile, context }) => {
      if (!profile.email) {
        throw new Error(
          "No email is associated with your twitter account, please try a different login method."
        );
      }
      const baseUrl = context?.baseUrl as string;

      const nameParts = profile.name.split(" ");

      const values = {
        firstName: nameParts.at(0) ?? "",
        lastName: nameParts.at(-1) ?? "",
        email: profile.email,
        img: profile.profile_image_url_https,
        verified: profile.verified,
        password: profile.email,
      };

      return oauth({ values, baseUrl });
    }
  )
);

authenticator.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      callbackURL: getCallback(SocialsProvider.GITHUB),
    },
    async ({ profile, context }) => {
      const baseUrl = context?.baseUrl as string;

      const nameParts = profile._json.name.split(" ");

      const values = {
        firstName: nameParts.at(0) ?? "",
        lastName: nameParts.at(-1) ?? "",
        email: profile._json.email,
        img: profile._json.avatar_url,
        verified: true,
        password: profile._json.email,
      };

      return oauth({ values, baseUrl });
    }
  )
);
