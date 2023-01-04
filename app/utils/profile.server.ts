import { PrismaClient } from "@prisma/client";
import { exclude } from "./exclude";

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
