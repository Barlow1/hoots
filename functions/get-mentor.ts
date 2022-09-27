import { Handler } from "@netlify/functions";
import { Mentor, PrismaClient, Profile } from "@prisma/client";
import { exclude } from "~/utils/exclude";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Origin, X-Requested-With, Content-Type, Accept",
};

const handler: Handler = async (event, context) => {
  const { id } = event.queryStringParameters || {};
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
    };
  }

  const prisma = new PrismaClient();
  await prisma.$connect();

  try {
    const mentor = await prisma.mentor.findUnique({
      where: {
        id,
      },
      include: {
        profile: true,
      },
    });
    const mentorWithoutPassword:
      | (Mentor & {
          profile: Omit<Profile, "password"> | null;
        })
      | null = mentor;
    if (mentor?.profile && mentorWithoutPassword) {
      const mentorProfileWithoutPassword = exclude(mentor?.profile, "password");
      mentorWithoutPassword.profile = mentorProfileWithoutPassword;
    }

    return {
      statusCode: 200,
      body: JSON.stringify(mentorWithoutPassword),
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json",
      },
    };
  } catch (error) {
    if (error instanceof Error)
      console.error("Failed to get mentor", error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export { handler };
