import type { Profile } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { exclude } from "./exclude";
import { createVerificationLink } from "./email-verification.server";
import { sendEmail } from "./email.server";

const SALT_ROUNDS = 10;

export const getFreshUser = async (userId: string) => {
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    const user = await prisma.profile.findUniqueOrThrow({
      where: {
        id: userId,
      },
    });
    return exclude(user, "password");
  } catch (e) {
    console.error("Error fetching fresh user", e);
    throw e;
  } finally {
    prisma.$disconnect();
  }
};

export const updateStripeCustomerId = async (
  userId: string,
  stripeCustomerId: string
) => {
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    const user = await prisma.profile.update({
      where: {
        id: userId,
      },
      data: {
        stripeCustomerId,
      },
    });
    return exclude(user, "password");
  } catch (e) {
    console.error("Error updating customer stripe id", e);
    throw e;
  } finally {
    prisma.$disconnect();
  }
};

export const oauth = async ({
  values,
  baseUrl,
}: {
  values: {
    firstName: string;
    lastName: string;
    email: string;
    img: string;
    verified: boolean;
    password: string;
  };
  baseUrl: string;
}) => {
  const prisma = new PrismaClient();
  await prisma
    .$connect()
    .catch((err) => console.error("Failed to connect to db", err));
  let hootsProfile: Profile | undefined;

  const foundUser = await prisma.profile.findUnique({
    where: {
      email: values.email,
    },
  });

  if (foundUser) {
    hootsProfile = foundUser;
  } else {
    const encrypted = bcrypt.hashSync(values.email, SALT_ROUNDS);
    const createdUser = await prisma.profile.create({
      data: {
        ...values,
        password: encrypted,
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
};
