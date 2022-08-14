import { Handler } from "@netlify/functions";
import { PrismaClient } from "@prisma/client";
import { pipeline } from "stream";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Origin, X-Requested-With, Content-Type, Accept",
};

const handler: Handler = async (event, context) => {
  const query = event.queryStringParameters?.query;
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
    };
  }

  const prisma = new PrismaClient();
  await prisma.$connect();

  try {
    const mentors = await prisma.mentor.aggregateRaw({
      pipeline: [
        {
          $search: {
            index: "default",
            text: {
              query,
              path: {
                wildcard: "*",
              },
            },
          },
        },
      ],
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
    console.error("Failed to search", error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export { handler };
