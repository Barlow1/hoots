import { Handler } from "@netlify/functions";
import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';
const SALT_ROUNDS = 10;

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
  if (body.firstName.includes('Pretty Jeanie wants your attention')) {
    return {
      statusCode: 403
    }
  }

  const prisma = new PrismaClient();
  await prisma.$connect();

  console.log('update user img', body.img);

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
          img: body.img,
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
        const encrypted = bcrypt.hashSync(body.password, SALT_ROUNDS);
        user = await prisma.profile.create({
          data: {
            email: body.email,
            password: encrypted,
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
