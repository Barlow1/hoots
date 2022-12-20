import type { Profile } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { routes } from '~/routes';

const SALT_ROUNDS = 10;

export function createVerificationLink({
  email,
  domainUrl,
}: {
  email: string;
  domainUrl: string;
}) {
  const url = new URL(domainUrl);
  const token = createToken({ email });
  url.pathname = routes.startVerifyEmail;
  url.searchParams.set('token', token);
  return url.toString();
}

export function createToken({ email }: { email: string }) {
  return bcrypt.hashSync(email, SALT_ROUNDS);
}

export function verifyToken({
  urlToken,
  email,
}: {
  urlToken: string;
  email: string;
}) {
  return bcrypt.compareSync(email, urlToken);
}

export async function updateVerifiedProfile({
  verified,
  profileId,
}: {
  verified: boolean;
  profileId: string;
}): Promise<Profile> {
  const prisma = new PrismaClient();
  await prisma.$connect();
  return prisma.profile
    .update({
      where: {
        id: profileId,
      },
      data: {
        verified,
      },
    })
    .then((response) => response)
    .catch((error) => {
      console.error(`Error updating email for id: ${profileId}`, error);
      throw error;
    })
    .finally(() => {
      prisma.$disconnect();
    });
}
