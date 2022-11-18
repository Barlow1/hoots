import { Stack, Heading, Flex, Avatar, useColorModeValue, Text, HStack } from "@chakra-ui/react";
import { PrismaClient, Goal } from "@prisma/client";
import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireUser } from "~/utils/user.session";
import { GoalsContainer } from ".";

export const loader: LoaderFunction = async ({ request, params }) => {
  const baseUrl = new URL(request.url).origin;
  const user = await requireUser(request);
  let mentorProfile = null;
  let goals;
  if (user) {
    const prisma = new PrismaClient();
    prisma
      .$connect()
      .catch((err) => console.error("Failed to connect to db", err));
    mentorProfile = await prisma.mentor.findUnique({
      where: {
        profileId: user.id,
      },
    });
    if (mentorProfile) {
      goals = await prisma.goal.findMany({
        include: {
            user: true
        },
        where: {
          AND: [
            {
              sharedWithMentors: {
                some: {
                  id: mentorProfile.id,
                },
              },
            },
            {
              userId: params.id,
            },
          ],
        },
      });
    }
  }

  return json({ goals: goals as Goal[] });
};

export default function SharedGoals() {
  const { goals } = useLoaderData();
  const user = goals[0].user;

  return (
    <>
      <Stack maxW={"lg"} px={6} py={6}>
        <Heading size={'md'}>Shared by</Heading>
        <Flex>
          <Avatar src={user.img ?? undefined} size={'sm'} />
          <Text
            fontSize={"lg"}
            color={useColorModeValue("gray.600", "gray.200")}
            alignSelf={"center"}
            ml={3}
          >
            {user.firstName} {user.lastName}
          </Text>
        </Flex>
      </Stack>
      <GoalsContainer userGoals={goals} isReadOnly />
    </>
  );
}
