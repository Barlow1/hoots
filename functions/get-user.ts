import { Handler } from "@netlify/functions";
import { PrismaClient } from "@prisma/client";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Origin, X-Requested-With, Content-Type, Accept",
};

const handler: Handler = async (event, context) => {
  const { id, email } = event.queryStringParameters || {};
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
    };
  }

  const prisma = new PrismaClient();
  await prisma.$connect();

  try {
    const user = await prisma.profile.findUnique({
      where: {
        id,
        email,
      },
    });
    return {
      statusCode: 200,
      body: JSON.stringify(user),
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json",
      },
    };
  } catch (error) {
    console.error("Failed to get user", error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export { handler };
