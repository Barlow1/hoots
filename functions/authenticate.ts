import { Handler } from "@netlify/functions";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { exclude } from "~/utils/exclude";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Origin, X-Requested-With, Content-Type, Accept",
};

const handler: Handler = async (event, context) => {
  const body = JSON.parse(event.body ?? "{}");
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
    const passwordMatch = bcrypt.compareSync(body.password, user.password);
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
        body: JSON.stringify({ user: exclude(user, "password") }),
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        },
      };
    }
  } catch (error) {
    if (error instanceof Error)
      console.error("Failed to authenticate user", error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export { handler };
