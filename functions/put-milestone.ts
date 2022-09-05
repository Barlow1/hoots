import { Handler } from "@netlify/functions";
import { GoalMilestone, PrismaClient } from "@prisma/client";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Origin, X-Requested-With, Content-Type, Accept",
};

enum FormType {
  NEW = "New",
  EDIT = "Edit",
  COMPLETED = "Completed",
}

const handler: Handler = async (event, context) => {
  const body: GoalMilestone = JSON.parse(event.body ?? "{}", (key, value) => {
    if (key === "completed") {
      return value === "true";
    }
    return value;
  });
  const goalId = event.queryStringParameters?.goalId;
  const formType = event.queryStringParameters?.formType;

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
    if (!goalId) {
      return {
        statusCode: 400,
        body: "Input Value Error - Supply goalId as a query string parameter",
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        },
      };
    }
    if (body.id && event.httpMethod === "DELETE") {
      response = await prisma.goal.update({
        data: {
          milestones: {
            deleteMany: { where: { id: body.id } },
          },
        },
        where: { id: goalId },
      });
    } else if (formType === FormType.EDIT) {
      response = await prisma.goal.update({
        where: {
          id: goalId,
        },
        data: {
          milestones: {
            updateMany: {
              where: {
                id: body.id,
              },
              data: {
                name: body.name,
                notes: body.notes,
                date: body.date,
              },
            },
          },
        },
      });
    } else if (goalId && formType === FormType.NEW) {
      response = await prisma.goal.update({
        data: {
          milestones: {
            push: { ...body, completed: false },
          },
        },
        where: { id: goalId },
      });
    } else if (goalId && formType === FormType.COMPLETED) {
      response = await prisma.goal.update({
        where: {
          id: goalId,
        },
        data: {
          milestones: {
            updateMany: {
              where: {
                id: body.id,
              },
              data: {
                completed: body.completed,
              },
            },
          },
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
    if (error instanceof Error)
      console.error("Failed to put goal", error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export { handler };
