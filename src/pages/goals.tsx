import { Box, Button, Grid, GridItem, Progress } from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";
import * as React from "react";
import { GoalsDialog } from "../components/goalsDialog";
export interface UserGoal {
  name: string;
  dueDate: string;
  progress: number;
  notes?: string;
}

const GoalsPage = () => {
  const [userGoals, setUserGoals] = React.useState<UserGoal[]>([]);

  React.useEffect(() => {
    setUserGoals([
      {
        name: "Learn React and Redux",
        dueDate: "December 1st, 2023",
        progress: 75,
      },
      {
        name: "Get an internship",
        dueDate: "June 10th, 2023",
        progress: 100,
      },
      {
        name: "Create a portfolio page",
        dueDate: "January 1st, 2023",
        progress: 100,
      },
      {
        name: "Learn Javascript",
        dueDate: "August 21st, 2022",
        progress: 100,
      },
    ]);
  }, []);

  return (
    <>
      <GoalsContainer userGoals={userGoals} setUserGoals={setUserGoals} />
    </>
  );
};

export const gridItemStyle: React.CSSProperties = {
  padding: "1rem",
  borderTop: "2px solid #E2E8F0",
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
  const [editingIndex, setEditingIndex] = React.useState<number | undefined>(
    undefined
  );
  const openDialog = (param: number | undefined) => {
    setEditingIndex(param);
    setIsDialogOpen(true);
  };
  return (
    <Box
      style={{ width: "90%", height: "100%", padding: "2rem", margin: "auto" }}
    >
      <Box style={{ width: "100%", textAlign: "right" }}>
        <Button
          backgroundColor={"brand.500"}
          _hover={{ bg: "brand.200" }}
          style={{ color: "white", margin: "1rem" }}
          onClick={() => openDialog(undefined)}
        >
          Add Goal <AddIcon style={{ marginLeft: "0.5em" }} />
        </Button>
      </Box>
      <Grid
        templateColumns="repeat(7, 1fr)"
        style={{
          border: "2px solid #E2E8F0",
          borderRadius: "10px",
          padding: "0rem 1rem 1rem 1rem",
        }}
      >
        <GridItem colSpan={2} style={{ padding: "1rem", fontWeight: "bold" }}>
          Goal
        </GridItem>
        <GridItem colSpan={2} style={{ padding: "1rem", fontWeight: "bold" }}>
          Due
        </GridItem>
        <GridItem
          colSpan={2}
          style={{ padding: "1rem", textAlign: "right", fontWeight: "bold" }}
        >
          Progress
        </GridItem>
        <GridItem
          colSpan={1}
          style={{ padding: "1rem", fontWeight: "bold", textAlign: "center" }}
        >
          Actions
        </GridItem>
        {userGoals.map((item, index) => {
          return (
            <>
              <GoalsItem
                key={`goal-${index}`}
                name={item.name}
                dueDate={item.dueDate}
                progress={item.progress}
              />
            </>
          );
        })}
      </Grid>
      <GoalsDialog
        userGoals={userGoals}
        setUserGoals={setUserGoals}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        index={editingIndex}
      />
    </Box>
  );
};

export const GoalsItem = ({ name, dueDate, progress }: UserGoal) => {
  return (
    <>
      <GridItem colSpan={2} style={gridItemStyle}>
        {name}
      </GridItem>
      <GridItem colSpan={2} style={gridItemStyle}>
        {dueDate}
      </GridItem>
      <GridItem colSpan={2} style={{ ...gridItemStyle, textAlign: "right" }}>
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
        colSpan={1}
        style={{
          display: "flex",
          padding: "1rem",
          borderTop: "2px solid #E2E8F0",
          justifyContent: "space-evenly",
        }}
      >
        <Button style={{ backgroundColor: "#3182CE" }}>
          <EditIcon style={{color: "white"}}/>
        </Button>
        <Button style={{ backgroundColor: "#E53E3E" }}>
          <DeleteIcon style={{color: "white"}}/>
        </Button>
      </GridItem>
    </>
  );
};

export default GoalsPage;
