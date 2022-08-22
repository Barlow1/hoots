import { Handler } from "@netlify/functions";
import { Mentor, PrismaClient } from "@prisma/client";

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

  try {
    const mentorProfile = await prisma.mentor.create({
      data: {
        ...mentor,
      },
    });
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
