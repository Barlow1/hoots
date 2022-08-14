import { Handler } from "@netlify/functions";
import { PrismaClient } from "@prisma/client";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Origin, X-Requested-With, Content-Type, Accept",
};

const handler: Handler = async (event, context) => {
  const id = event.queryStringParameters?.id;
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
    let user;
    if (id) {
      // update user
      user = await prisma.profile.update({
        where: {
          id,
        },
        data: {
          industry: body.industry,
          bio: body.bio,
          experience: body.experience,
          mentorPreferences: {
            experience: body.mentorExperience,
            cost: body.mentorCost,
          },
        },
      });
    } else {
      // create user
      const existingUser = await prisma.profile.findUnique({
        where: {
          email: body.email,
        },
      });
      if (existingUser) {
        return {
          statusCode: 409,
          body: JSON.stringify({
            error:
              "Email already exists, please login or create a new account.",
          }),
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json",
          },
        };
      } else {
        user = await prisma.profile.create({
          data: {
            email: body.email,
            password: body.password,
            firstName: body.firstName,
            lastName: body.lastName,
          },
        });
      }
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ user }),
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json",
      },
    };
  } catch (error) {
    if (error instanceof Error)
    console.error("Failed to get user", error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export { handler };
