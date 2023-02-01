import { PrismaClient } from "@prisma/client";

export const createPlan = async ({
  stripeProductId,
  mentorProfileId,
  numCalls,
}: {
  stripeProductId: string;
  mentorProfileId: string;
  numCalls: number;
}) => {
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    const plan = await prisma.plan.create({
      data: {
        mentorProfileId,
        stripeProductId,
        numCalls,
      },
    });
    return plan;
  } catch (e) {
    console.error("Error creating plan", e);
    throw e;
  } finally {
    prisma.$disconnect();
  }
};

export const getPlansByMentorId = async (mentorId: string) => {
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    const plans = prisma.plan.findMany({
      where: {
        mentorProfileId: mentorId,
      },
    });
    return plans;
  } catch (e) {
    console.error("Error fetching plans", e);
    throw e;
  } finally {
    prisma.$disconnect();
  }
};
