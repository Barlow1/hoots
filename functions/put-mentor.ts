import { Handler } from "@netlify/functions";
import { Mentor, PrismaClient } from "@prisma/client";
import { exclude } from "~/utils/exclude";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Origin, X-Requested-With, Content-Type, Accept",
};

const handler: Handler = async (event, context) => {
  const mentor = JSON.parse(event.body ?? "{}", (key, value) => {
    if (key === "cost") {
      return Number(value);
    }
    return value;
  }) as Mentor;
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
    };
  }

  const prisma = new PrismaClient();
  await prisma.$connect();
  const mentorId = mentor.id;
  const mentorWithoutId = exclude({ ...mentor }, "id");
  const mentorWithoutProfileId = exclude({ ...mentorWithoutId }, "profileId");

  try {
    let mentorProfile;
    if (mentorId) {
      mentorProfile = await prisma.mentor.update({
        data: {
          ...mentorWithoutProfileId,
          profile: {
            connect: {
              id: mentorWithoutId.profileId ?? undefined,
            },
          },
        },
        where: {
          id: mentorId,
        },
      });
    } else {
      mentorProfile = await prisma.mentor.create({
        data: {
          ...mentorWithoutProfileId,
          profile: {
            connect: {
              id: mentorWithoutId.profileId ?? undefined,
            },
          },
        },
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ mentorProfile }),
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json",
      },
    };
  } catch (error) {
    if (error instanceof Error)
      console.error("Failed to create mentor", error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export { handler };
