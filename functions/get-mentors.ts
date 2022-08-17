import { Handler } from "@netlify/functions";
import { PrismaClient } from "@prisma/client";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Origin, X-Requested-With, Content-Type, Accept",
};

const handler: Handler = async (event, context) => {
  const query = event.queryStringParameters?.query;
  const costMin = Number(event.queryStringParameters?.min_cost);
  const costMax = Number(event.queryStringParameters?.max_cost);
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
    };
  }

  const prisma = new PrismaClient();
  await prisma.$connect();

  try {
    let mentors: any = [];
    const filtersSelected =
      costMin || costMin === 0 || costMax || costMax === 0;
    // just query no filters
    if (query && !filtersSelected) {
      mentors = await prisma.mentor.aggregateRaw({
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
      // no query just filters
    } else if (!query && filtersSelected) {
      mentors = await prisma.mentor.aggregateRaw({
        pipeline: [
          {
            $search: {
              index: "default",
              range: {
                path: "cost",
                gte: costMin,
                lte: costMax,
              },
            },
          },
        ],
      });
      // both query & filters
    } else if (query && filtersSelected) {
      mentors = await prisma.mentor.aggregateRaw({
        pipeline: [
          {
            $search: {
              index: "default",
              compound: {
                should: [
                  {
                    text: {
                      query,
                      path: {
                        wildcard: "*",
                      },
                    },
                  },
                ],
                must: [
                  {
                    range: {
                      path: "cost",
                      gte: costMin,
                      lte: costMax,
                    },
                  },
                ],
              },
            },
          },
        ],
      });
    } else {
      mentors = await prisma.mentor.findMany();
    }

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
      console.error("Failed to get mentors", error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export { handler };
