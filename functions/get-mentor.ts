import { Handler } from "@netlify/functions";
import { PrismaClient } from "@prisma/client";

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
    const mentors = await prisma.mentor.findUnique({
      where: {
        id,
      },
    });
    return {
      statusCode: 200,
      body: JSON.stringify(mentors),
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
