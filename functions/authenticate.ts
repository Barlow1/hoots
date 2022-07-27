import { Handler } from "@netlify/functions";
import { PrismaClient } from "@prisma/client";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Origin, X-Requested-With, Content-Type, Accept",
};

const handler: Handler = async (event, context) => {
  const body = JSON.parse(event.body ?? "{}");
  console.log("BODY", body);

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
        email: body.email,
      },
    });
    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: "No user found with that email address.",
        }),
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        },
      };
    }
    const passwordMatch = body.password === user.password;
    if (!passwordMatch) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: "Password is incorrect.",
        }),
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        },
      };
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify({ user }),
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        },
      };
    }
  } catch (error) {
    console.error("Failed to get user", error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export { handler };
