import * as React from "react";
import { Box, Button, Checkbox, Grid, GridItem } from "@chakra-ui/react";
import {
  Link,
  LoaderFn,
  MakeGenerics,
  useMatch,
} from "@tanstack/react-location";
import { UserGoal } from ".";
import { routes } from "../../routes";

type Route = MakeGenerics<{
  LoaderData: { goal: UserGoal };
  Params: { id: string };
}>;

export const loader: LoaderFn<Route> = async () => {
  // const baseUrl = import.meta.env.VITE_API_URL;
  // const goals = await fetch(`${baseUrl}/.netlify/functions/get-goals?id=${params.id}`)
  //   .then((goals) => goals.json())
  //   .catch(() => {
  //     alert("Failed to get goals, please try again in a few minutes.");
  //   });

  const goal = {
    name: "Learn React and Redux",
    dueDate: "December 1st, 2023",
    progress: 75,
  };

  return { goal: goal as UserGoal };
};

const MilestonePage = () => {
  const { data } = useMatch<Route>();
  const [goal, setGoal] = React.useState<UserGoal>(data.goal);
  return (
    <Box>
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
            <MilestoneItem
              key={`goal-${index}`}
              name={item.name ?? ""}
              dueDate={item.dueDate ?? ""}
              index={index}
              openDialog={openDialog}
              onDelete={onDelete}
            />
          );
        })}
      </Grid>
    </Box>
  );
};

export const gridItemStyle: React.CSSProperties = {
  padding: "1rem",
  borderTop: "2px solid #E2E8F0",
  display: "flex",
  alignItems: "center",
};

export interface MilestoneItemProps {
  name: string;
  dueDate: string;
  completed: boolean;
  index: number;
  openDialog: Function;
  onDelete: Function;
}

export const MilestoneItem = ({
  name,
  dueDate,
  completed,
  index,
  openDialog,
  onDelete,
}: MilestoneItemProps) => {
  return (
    <>
      <GridItem colSpan={1} style={gridItemStyle}>
        <Checkbox />
      </GridItem>
      <GridItem colSpan={4} style={gridItemStyle}>
        {name}
      </GridItem>
      <GridItem colSpan={4} style={gridItemStyle}>
        {dueDate}
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
        {progress === 100 && "Complete"}
      </GridItem>
    </>
  );
};

export default MilestonePage;
