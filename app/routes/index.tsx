import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  CircularProgressLabel,
  Grid,
  GridItem,
  Link,
  Text,
} from "@chakra-ui/react";
import { useUser } from "~/utils/useRootData";
import { routes } from "../routes";
import { Link as NavLink, useLoaderData } from "@remix-run/react";
import { requireUser } from "~/utils/user.session";
import { json, LoaderFunction } from "@remix-run/node";
import { Goal } from "@prisma/client";
import { calculateGoalProgress } from "~/utils/calculateGoalProgress";
import { formatDateDisplay } from "~/utils/dates";

interface DashBoardLoaderData {
  upcomingGoal: Goal | undefined;
}

export const loader: LoaderFunction = async ({ request }) => {
  const baseUrl = new URL(request.url).origin;
  const user = await requireUser(request);
  const goals: Goal[] = await fetch(
    `${baseUrl}/.netlify/functions/get-goals?userId=${user?.id}`
  )
    .then((goals) => goals.json())
    .catch(() => {
      console.error("Failed to get goals, please try again in a few minutes.");
    });
  // filter to only current goals and sort by most recent first
  const filtered = goals
    .filter((goal) => new Date(goal.dueDate).getTime() > new Date().getTime())
    .sort((a, b) => {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  const upcomingGoal = filtered.at(0);
  return json({ upcomingGoal });
  return null;
};

const Dashboard = () => {
  const data = useLoaderData<DashBoardLoaderData>();
  const user = useUser();
  const goalProgress = calculateGoalProgress(data.upcomingGoal?.milestones);
  return (
    <Grid gap={6}>
      <GridItem boxShadow="md" colSpan={12} w="100%" borderRadius="5">
        <Box padding="5">
          <Grid gap={6}>
            <GridItem colSpan={12}>
              <Text fontSize="xl" fontWeight="bold">
                {user && `${user.firstName} ${user.lastName}`}
              </Text>
              <Text fontSize="sm">{user?.email}</Text>
            </GridItem>
            <GridItem colSpan={3}>
              <Text textColor="#9faec0" fontWeight="bold">
                Industry
              </Text>
              <Text pt="3" m="auto" fontSize="sm">
                {user?.industry || "-"}
              </Text>
            </GridItem>
          </Grid>
        </Box>
      </GridItem>
      <GridItem boxShadow="md" w="100%" colSpan={12} borderRadius="5">
        <Grid padding="5" gap={4}>
          <GridItem colSpan={12}>
            <Text fontSize="xl" fontWeight="bold">
              Upcoming Goal Progress
            </Text>
            {data.upcomingGoal && (
              <Box display="flex" justifyContent="center">
                <Box>
                  <Text fontSize="lg">
                    {data.upcomingGoal.name
                      ? `"${data.upcomingGoal.name}"`
                      : "-"}
                  </Text>
                  <Text fontSize="sm">
                    {formatDateDisplay(data.upcomingGoal.dueDate)}
                  </Text>
                </Box>
              </Box>
            )}
          </GridItem>
          {data.upcomingGoal ? (
            <GridItem display="flex" justifyContent="center" colSpan={12}>
              <CircularProgress
                value={goalProgress}
                color="green.400"
                size="150px"
              >
                <CircularProgressLabel>
                  {`${goalProgress}%`}
                </CircularProgressLabel>
              </CircularProgress>
            </GridItem>
          ) : (
            <GridItem display="flex" justifyContent="center" colSpan={12}>
              <Text fontSize="lg">No upcoming goal found.</Text>
            </GridItem>
          )}
          <GridItem colSpan={12}>
            <Link
              justifyContent="center"
              href={routes.goals}
              style={{ textDecoration: "none", display: "flex" }}
              _focus={{ boxShadow: "none" }}
            >
              <Button background="brand.900" textColor="white">
                Manage Goals
              </Button>
            </Link>
          </GridItem>
        </Grid>
      </GridItem>
    </Grid>
  );
};

export default Dashboard;
