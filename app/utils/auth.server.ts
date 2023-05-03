import type { Profile } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { Authenticator } from "remix-auth";
import { GoogleStrategy, SocialsProvider } from "remix-auth-socials";
import { sessionStorage } from "~/utils/user.session.server";
import bcrypt from "bcrypt";
import { exclude } from "./exclude";
import { createVerificationLink } from "./email-verification.server";
import { sendEmail } from "./email.server";

const SALT_ROUNDS = 10;

// Create an instance of the authenticator
export const authenticator = new Authenticator<Partial<Profile>>(
  sessionStorage,
  {
    sessionKey: "user",
  }
);
// You may specify a <User> type which the strategies will return (this will be stored in the session)
// export let authenticator = new Authenticator<User>(sessionStorage, { sessionKey: '_session' });

const getCallback = (provider: SocialsProvider) =>
  `/auth/${provider}/callback`;

authenticator.use(
  new GoogleStrategy(
    {
      clientID:
        "885591328473-g4pn39g4upilj38n4k5q339mbvq5ij44.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: getCallback(SocialsProvider.GOOGLE),
    },
    async ({ profile, context  }) => {
      const baseUrl = context?.baseUrl as string;
      // here you would find or create a user in your database
      const prisma = new PrismaClient();
      const encrypted = bcrypt.hashSync(profile._json.email, SALT_ROUNDS);
      await prisma
        .$connect()
        .catch((err) => console.error("Failed to connect to db", err));
      const values = {
        firstName: profile._json.given_name,
        lastName: profile._json.family_name,
        email: profile._json.email,
        img: profile._json.picture,
        verified: profile._json.email_verified,
        password: encrypted,
      };
      let hootsProfile: Profile | undefined;

      const foundUser = await prisma.profile.findUnique({
        where: {
          email: values.email,
        },
      });

      if (foundUser) {
        hootsProfile = foundUser;
      } else {
        const createdUser = await prisma.profile.create({
          data: {
            ...values,
          },
        });
        hootsProfile = createdUser;
      }

      if (!hootsProfile.verified) {
        const verificationLink = createVerificationLink({
          email: values.email,
          domainUrl: baseUrl,
        });
        await sendEmail({
          toName: `${hootsProfile.firstName} ${hootsProfile.lastName}`,
          fromName: "Hoots",
          email: hootsProfile.email,
          subject: "Email Verification",
          variables: {
            firstName: hootsProfile.firstName,
            verificationLink,
          },
          template: "email-verification",
        });
      }

      return exclude(hootsProfile, "password");
    }
  )
);
