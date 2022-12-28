import type { Goal } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Avatar from "~/components/Avatar";
import { H4, Paragraph } from "~/components/Typography";
import { requireUser } from "~/utils/user.session.server";
import { GoalsContainer } from ".";

export const loader: LoaderFunction = async ({ request, params }) => {
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
          user: true,
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
  const { user } = goals[0];

  return (
    <>
      <div className=" max-w-lg p-6">
        <H4>Shared by</H4>
        <div className="flex pt-2">
          <Avatar src={user.img ?? undefined} size="xs" />
          <Paragraph className=" self-center ml-3">
            {user.firstName} {user.lastName}
          </Paragraph>
        </div>
      </div>
      <GoalsContainer userGoals={goals} isReadOnly />
    </>
  );
}
