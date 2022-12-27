import { Link as NavLink, useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { Goal, Mentor } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAward, faListDots } from "@fortawesome/free-solid-svg-icons";
import { useUser } from "~/utils/useRootData";
import { requireUser } from "~/utils/user.session.server";
import { calculateGoalProgress } from "~/utils/calculateGoalProgress";
import { formatDateDisplay } from "~/utils/dates";
import { routes } from "~/routes";
import { H4, H6, Paragraph } from "~/components/Typography";
import Button from "~/components/Buttons/IconButton";
import CircularProgress, {
  CircularProgressLabel,
} from "~/components/CircularProgress";
import Avatar from "~/components/Avatar";

interface DashBoardLoaderData {
  upcomingGoal: Goal | undefined;
  mentors: Mentor[] | null;
}

export const loader: LoaderFunction = async ({ request }) => {
  const baseUrl = new URL(request.url).origin;
  const user = await requireUser(request);
  const goals: Goal[] = await fetch(
    `${baseUrl}/.netlify/functions/get-goals?userId=${user?.id}`
  )
    .then((response) => response.json())
    .catch(() => {
      console.error("Failed to get goals, please try again in a few minutes.");
    });
  // filter to only current goals and sort by most recent first
  const filtered = goals
    .filter((goal) => new Date(goal.dueDate).getTime() > new Date().getTime())
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

  let mentors: Mentor[] | null = null;
  try {
    const prisma = new PrismaClient();
    await prisma.$connect();
    mentors = await prisma.mentor.findMany({
      where: {
        menteeIDs: {
          hasSome: [user?.id],
        },
      },
    });
  } catch (e) {
    console.error("Failed to fetch mentors", e);
  }

  const upcomingGoal = filtered.at(0);
  return json({ upcomingGoal, mentors });
  return null;
};

function Dashboard() {
  const data = useLoaderData<DashBoardLoaderData>();
  const user = useUser();
  const goalProgress = calculateGoalProgress(data.upcomingGoal?.milestones);
  const currentMentors = data?.mentors;
  return (
    <div className="grid gap-6">
      <div className="shadow-md dark:bg-zinc-800 col-span-12 w-full rounded-md">
        <div className="p-5">
          <div className="grid gap-6">
            <div className="col-span-12">
              <H4 className="font-bold">
                {user && `${user.firstName} ${user.lastName}`}
              </H4>
              <Paragraph className="text-sm pt-2">{user?.email}</Paragraph>
            </div>
            <div className="col-span-3">
              <Paragraph className="font-bold text-gray-700 dark:text-gray-200 text-md">
                Industry
              </Paragraph>
              <Paragraph className="text-sm pt-3">
                {user?.industry || "-"}
              </Paragraph>
            </div>
            {currentMentors?.length ? (
              <div className="col-span-3">
                <Paragraph className="font-bold text-gray-700 dark:text-gray-200 text-md">
                  Mentors
                </Paragraph>
                {currentMentors.slice(0, 3).map((mentor) => (
                  <div className="flex flex-row space-x-3 pt-3" key={mentor.id}>
                    <Avatar size="md" src={mentor.img ?? undefined} />
                    <Paragraph className=" text-sm m-auto">
                      {mentor.name || "-"}
                    </Paragraph>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="shadow-md dark:bg-zinc-800 col-span-12 lg:col-span-6 h-full w-full rounded-md">
        <div className="p-5 gap-4 h-full grid">
          <div className="col-span-12">
            <H4 className="font-bold">Find a mentor</H4>
          </div>
          <div className="col-span-12 flex justify-center">
            <Paragraph className="font-sm w-[50%]">
              Easily find the mentor or coach you've been looking for 🕵️
            </Paragraph>
          </div>
          <div className="col-span-12 justify-end flex flex-col">
            <div>
              <NavLink
                to={routes.browse}
                className="justify-center decoration-transparent flex focus:shadow-none "
              >
                <Button
                  variant="primary"
                  className="mx-6 w-full"
                  rightIcon={
                    <FontAwesomeIcon className="ml-2" icon={faListDots} />
                  }
                >
                  Browse
                </Button>
              </NavLink>
            </div>
          </div>
        </div>
      </div>
      <div className="shadow-md dark:bg-zinc-800 col-span-12 lg:col-span-6 h-full w-full rounded-md">
        <div className="p-5 gap-4 h-full grid">
          <div className="col-span-12">
            <H4 className="font-bold"> Upcoming Goal Progress</H4>
            {data.upcomingGoal && (
              <div className="flex justify-center pt-2 text-center">
                <div>
                  <H6 className="font-lg">
                    {data.upcomingGoal.name
                      ? `"${data.upcomingGoal.name}"`
                      : "-"}
                  </H6>
                  <Paragraph className="font-sm">
                    {formatDateDisplay(data.upcomingGoal.dueDate)}
                  </Paragraph>
                </div>
              </div>
            )}
          </div>
          <div className="col-span-12 flex justify-center">
            {data.upcomingGoal ? (
              <CircularProgress value={goalProgress}>
                <CircularProgressLabel>
                  {`${goalProgress}%`}
                </CircularProgressLabel>
              </CircularProgress>
            ) : (
              <Paragraph className="font-lg">No upcoming goal found.</Paragraph>
            )}
          </div>
          <div className="col-span-12 justify-end flex flex-col">
            <div>
              <NavLink
                to={routes.goals}
                className="justify-center decoration-transparent flex focus:shadow-none "
              >
                <Button
                  variant="primary"
                  className="mx-6 w-full"
                  rightIcon={
                    <FontAwesomeIcon className="ml-2" icon={faAward} />
                  }
                >
                  Manage Goals
                </Button>
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
