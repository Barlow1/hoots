import { Handler } from "@netlify/functions";
import { PrismaClient } from "@prisma/client";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Origin, X-Requested-With, Content-Type, Accept",
};

const handler: Handler = async (event, context) => {
  const id = event.queryStringParameters?.id;
  const userId = event.queryStringParameters?.userId;
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
    };
  }

  const prisma = new PrismaClient();
  await prisma.$connect();

  try {
    let response;
    if (id) {
      response = await prisma.goal.findUnique({
        where: {
          id,
        },
      });
    } else {
      response = await prisma.goal.findMany({ where: { userId } });
    }
    return {
      statusCode: 200,
      body: JSON.stringify(response),
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json",
      },
    };
  } catch (error) {
    console.error("Failed to get goals", error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export { handler };
