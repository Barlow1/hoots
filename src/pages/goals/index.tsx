import { Box, Button, Grid, GridItem, Progress } from "@chakra-ui/react";
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";
import * as React from "react";
import { GoalsDialog } from "../../components/goalsDialog";
import {
  Link,
  LoaderFn,
  MakeGenerics,
  useMatch,
} from "@tanstack/react-location";
import { routes } from "../../routes";
import { getStoredUser, useUser } from "../../components/UserContext";

export interface UserGoal {
  id: string;
  name?: string;
  dueDate?: string;
  progress?: number;
  notes?: string;
  milestones?: {
    name?: string;
    date?: string;
    completed?: boolean;
    notes?: string;
  }[];
}

type Route = MakeGenerics<{
  LoaderData: { goals: UserGoal[] };
  Params: { id: string };
}>;

export const loader: LoaderFn<Route> = async () => {
  const baseUrl = import.meta.env.VITE_API_URL;
  const user = getStoredUser();
  const goals = await fetch(
    `${baseUrl}/.netlify/functions/get-goals?userId=${user?.id}`
  )
    .then((goals) => goals.json())
    .catch(() => {
      alert("Failed to get goals, please try again in a few minutes.");
    });
  return { goals: goals as UserGoal[] };
};

const GoalsPage = () => {
  const { data } = useMatch<Route>();
  const [userGoals, setUserGoals] = React.useState<UserGoal[]>(
    data.goals ?? []
  );

  return (
    <>
      <GoalsContainer userGoals={userGoals} setUserGoals={setUserGoals} />
    </>
  );
};

export interface IGoalsContainerProps {
  userGoals: UserGoal[];
  setUserGoals: Function;
}
export const GoalsContainer = ({
  userGoals,
  setUserGoals,
}: IGoalsContainerProps) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const [editingIndex, setEditingIndex] = React.useState<string>("");
  const openDialog = (param: string) => {
    setEditingIndex(param);
    setIsDialogOpen(true);
  };
  const onDelete = (param: number) => {
    const newUserGoals = [...userGoals];
    newUserGoals.splice(param, 1);
    setUserGoals(newUserGoals);
  };
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
              progress={item.progress ?? 0}
              id={item.id}
              openDialog={openDialog}
              onDelete={onDelete}
            />
          );
        })}
      </Grid>
      <GoalsDialog
        userGoals={userGoals}
        setUserGoals={setUserGoals}
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
        <Link to={`${routes.goals}/${id}`}>{dueDate}</Link>
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
        <Button
          style={{ backgroundColor: "#E53E3E" }}
          onClick={() => onDelete(id)}
        >
          <DeleteIcon style={{ color: "white" }} />
        </Button>
      </GridItem>
    </>
  );
};

export default GoalsPage;
