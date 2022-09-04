import { Box, Button, Grid, GridItem, Progress } from "@chakra-ui/react";
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";
import * as React from "react";
import { GoalsDialog } from "../../components/goalsDialog";
import { routes } from "../../routes";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { Form, Link, useFetcher, useLoaderData } from "@remix-run/react";
import { getUser, requireUser } from "~/utils/user.session";
import { Goal, GoalMilestone } from "@prisma/client";
import { formatDateDisplay } from "~/utils/dates";

type Route = {
  data: { goals: Goal[] };
  params: { id: string };
};

export const loader: LoaderFunction = async ({ request }) => {
  const baseUrl = new URL(request.url).origin;
  const user = await getUser(request);
  const goals = await fetch(
    `${baseUrl}/.netlify/functions/get-goals?userId=${user?.id}`
  )
    .then((goals) => goals.json())
    .catch(() => {
      console.error("Failed to get goals, please try again in a few minutes.");
    });
  return json({ goals: goals as Goal[] });
};

export const action: ActionFunction = async ({ request }) => {
  const values = Object.fromEntries((await request.formData()).entries());
  const user = await requireUser(request);
  const baseUrl = new URL(request.url).origin;
  if (request.method === "DELETE") {
    const response = await fetch(
      `${baseUrl}/.netlify/functions/put-goal${
        values.goalId ? `?id=${values.goalId}` : ""
      }`,
      {
        method: "DELETE",
        body: null
      }
    ).catch(() => {
      console.error(
        "Failed to delete goal, please try again in a few minutes."
      );
    });
  } else if (request.method === "POST") {
    const response = await fetch(
      `${baseUrl}/.netlify/functions/put-goal?userId=${user?.id}${
        values.goalId ? `&id=${values.goalId}` : ""
      }`,
      {
        method: "PUT",
        body: JSON.stringify({
          name: values.nameInput,
          dueDate: values.dateInput,
          notes: values.notesInput,
          progress: values.goalId ? undefined : 0,
          id: values.goalId,
        }),
      }
    )
      .then((goal) => goal.json())
      .catch(() => {
        console.error("Failed to add goal, please try again in a few minutes.");
      });
    if (response.error) {
      console.error(response.error);
    } else if (response.goal) {
      return response.goal;
    }
  }
  return null;
};

const calculateGoalProgress = (milestones?: GoalMilestone[]): number => {
  if (!milestones) {
    return 0;
  }
  const totalCount = milestones.length;
  if (!totalCount) {
    return 0;
  }
  const completedCount = milestones.filter(
    (milestone) => milestone.completed
  ).length;
  return Math.ceil((completedCount / totalCount) * 100);
};

const GoalsPage = () => {
  const { goals } = useLoaderData();

  return (
    <>
      <GoalsContainer userGoals={goals} />
    </>
  );
};

export interface IGoalsContainerProps {
  userGoals: Goal[];
}
export const GoalsContainer = ({ userGoals }: IGoalsContainerProps) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const [editingIndex, setEditingIndex] = React.useState<string>("");
  const openDialog = (param: string) => {
    setEditingIndex(param);
    setIsDialogOpen(true);
  };
  const onDelete = (param: number) => {};

  return (
    <Box style={{ width: "90%", height: "100%", margin: "auto" }}>
      <Box style={{ width: "100%", textAlign: "right" }}>
        <Button
          backgroundColor={"brand.500"}
          _hover={{ bg: "brand.200" }}
          style={{ color: "white", margin: "1rem" }}
          onClick={() => openDialog("")}
        >
          Add Goal <AddIcon style={{ marginLeft: "0.5em" }} />
        </Button>
      </Box>
      <Grid
        templateColumns="repeat(16, 1fr)"
        style={{
          border: "2px solid #E2E8F0",
          borderRadius: "10px",
          padding: "0rem 1rem 1rem 1rem",
        }}
      >
        <GridItem colSpan={1} style={{ padding: "1rem" }}></GridItem>
        <GridItem colSpan={4} style={{ padding: "1rem", fontWeight: "bold" }}>
          Goal
        </GridItem>
        <GridItem colSpan={4} style={{ padding: "1rem", fontWeight: "bold" }}>
          Due
        </GridItem>
        <GridItem
          colSpan={4}
          style={{ padding: "1rem", textAlign: "right", fontWeight: "bold" }}
        >
          Progress
        </GridItem>
        <GridItem
          colSpan={3}
          style={{ padding: "1rem", fontWeight: "bold", textAlign: "center" }}
        >
          Actions
        </GridItem>
        {userGoals.map((item, index) => {
          return (
            <GoalsItem
              key={`goal-${index}`}
              name={item.name ?? ""}
              dueDate={item.dueDate ?? ""}
              progress={calculateGoalProgress(item.milestones) ?? 0}
              id={item.id}
              openDialog={openDialog}
              onDelete={onDelete}
            />
          );
        })}
      </Grid>
      <GoalsDialog
        userGoals={userGoals}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        id={editingIndex}
      />
    </Box>
  );
};

export const gridItemStyle: React.CSSProperties = {
  padding: "1rem",
  borderTop: "2px solid #E2E8F0",
  display: "flex",
  alignItems: "center",
};

export interface GoalsItemProps {
  name: string;
  dueDate: string;
  progress: number;
  id: string;
  openDialog: Function;
  onDelete: Function;
}

export const GoalsItem = ({
  name,
  dueDate,
  progress,
  id,
  openDialog,
  onDelete,
}: GoalsItemProps) => {
  const utcDate = formatDateDisplay(dueDate);
  const deleteFetcher = useFetcher();
  return (
    <>
      <GridItem colSpan={1} style={gridItemStyle}>
        <Link to={`${routes.goals}/${id}`}>
          <ChevronRightIcon />
        </Link>
      </GridItem>
      <GridItem colSpan={4} style={gridItemStyle}>
        <Link to={`${routes.goals}/${id}`}>{name}</Link>
      </GridItem>
      <GridItem colSpan={4} style={gridItemStyle}>
        <Link to={`${routes.goals}/${id}`}>{utcDate}</Link>
      </GridItem>
      <GridItem
        colSpan={4}
        style={
          progress < 100
            ? {
                padding: "1rem",
                borderTop: "2px solid #E2E8F0",
              }
            : { ...gridItemStyle, justifyContent: "right" }
        }
      >
        {progress < 100 && (
          <>
            <Progress
              colorScheme="green"
              size="sm"
              style={{ borderRadius: "500px" }}
              value={progress}
            />
            {progress}%
          </>
        )}
        {progress === 100 && "Complete 🎉"}
      </GridItem>
      <GridItem
        colSpan={3}
        style={{
          display: "flex",
          padding: "1rem",
          borderTop: "2px solid #E2E8F0",
          justifyContent: "space-evenly",
          alignContent: "center",
        }}
      >
        <Button
          style={{ backgroundColor: "#3182CE" }}
          onClick={() => openDialog(id)}
        >
          <EditIcon style={{ color: "white" }} />
        </Button>
        <deleteFetcher.Form method="delete">
          <input hidden name="goalId" value={id} />
          <Button style={{ backgroundColor: "#E53E3E" }} type="submit">
            <DeleteIcon style={{ color: "white" }} />
          </Button>
        </deleteFetcher.Form>
      </GridItem>
    </>
  );
};

export default GoalsPage;
