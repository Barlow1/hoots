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
    if (id && userId) {
      response = await prisma.goal.upsert({
        where: {
          id: id,
        },
        update: {
          name: body.name,
          userId: body.userId,
          dueDate: body.dueDate,
          notes: body.notes,
          milestones: body.milestones,
        },
        create: {
          name: body.name,
          userId: userId,
          dueDate: body.dueDate,
          notes: body.notes,
          progress: 0,
          milestones: [],
        },
      });
    } else if (userId) {
      response = await prisma.goal.create({
        data: {
          name: body.name,
          userId: userId,
          dueDate: body.dueDate,
          notes: body.notes,
          progress: 0,
          milestones: [],
        },
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ goal: response }),
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json",
      },
    };
  } catch (error) {
    console.error("Failed to put goal", error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export { handler };
