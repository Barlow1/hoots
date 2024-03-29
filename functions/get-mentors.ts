import { Handler } from "@netlify/functions";
import { PrismaClient } from "@prisma/client";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Origin, X-Requested-With, Content-Type, Accept",
};

const handler: Handler = async (event, context) => {
  const query = event.queryStringParameters?.query;
  const costMin = event.queryStringParameters?.min_cost;
  const costMax = event.queryStringParameters?.max_cost;
  const industries = event.queryStringParameters?.industry?.split(",");
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
    };
  }

  const prisma = new PrismaClient();
  await prisma.$connect();

  console.log("costMin", costMin);
  console.log("costMax", costMax);

  console.log("query", query);
  try {
    let mentors: any = [];
    const filtersSelected = costMin || costMax || industries;
    console.log("filterSelected", filtersSelected);

    // just query no filters
    if (query && !filtersSelected) {
      console.log(" query no filter");
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
      console.log("inside filter no query");
      const options: any = {
        pipeline: [
          {
            $search: {
              index: "default",
              compound: {},
            },
          },
        ],
      };
      if (costMax && costMin) {
        options.pipeline[0].$search.compound.must = [
          {
            range: {
              path: "cost",
              gte: Number(costMin),
              lte: Number(costMax),
            },
          },
        ];
      }
      if (industries?.[0]) {
        options.pipeline[0].$search.compound.filter = [
          {
            text: {
              query: industries,
              path: "industry",
            },
          },
        ];
      }
      mentors = await prisma.mentor.aggregateRaw(options);
      // both query & filters
    } else if (query && filtersSelected) {
      console.log("inside both query & filters");
      const options: any = {
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
              },
            },
          },
        ],
      };
      if (costMax && costMin) {
        options.pipeline[0].$search.compound.must = [
          {
            range: {
              path: "cost",
              gte: Number(costMin),
              lte: Number(costMax),
            },
          },
        ];
      }
      if (industries?.[0]) {
        options.pipeline[0].$search.compound.filter = [
          {
            text: {
              query: industries,
              path: "industry",
            },
          },
        ];
      }
      mentors = await prisma.mentor.aggregateRaw(options);
    } else {
      console.log("inside find many");
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
