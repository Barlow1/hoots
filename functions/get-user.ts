import { Handler } from "@netlify/functions";
import { PrismaClient } from "@prisma/client";
import { exclude } from "~/utils/exclude";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Origin, X-Requested-With, Content-Type, Accept",
};

const handler: Handler = async (event, context) => {
  const id = event.queryStringParameters?.id;
  const email = event.queryStringParameters?.email;

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
    };
  }

  const prisma = new PrismaClient();
  await prisma.$connect();

  try {
    console.log("prisma.profile.findUnique", prisma.profile.findUnique);
    const user = await prisma.profile.findUnique({
      where: {
        id,
        email,
      },
    });
    if (user) {
      return {
        statusCode: 200,
        body: JSON.stringify(exclude(user, "password")),
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        },
      };
    }
    throw Error("No user found with the given email");
  } catch (error) {
    if (error instanceof Error)
      console.error("Failed to get user", error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export { handler };
