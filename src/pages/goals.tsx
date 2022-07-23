import {
  Box,
  Button,
  Grid,
  GridItem,
  Progress,
  useStyles,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import * as React from "react";
export interface UserGoal {
  goal: string;
  dueDate: string;
  progress: number;
}

const GoalsPage = () => {
  const [userGoals, setUserGoals] = React.useState<UserGoal[]>([]);
  React.useEffect(() => {
    setUserGoals([
      {
        goal: "Learn React and Redux",
        dueDate: "December 1st, 2023",
        progress: 75,
      },
      {
        goal: "Get an internship",
        dueDate: "June 10th, 2023",
        progress: 100,
      },
      {
        goal: "Create a portfolio page",
        dueDate: "January 1st, 2023",
        progress: 100,
      },
      {
        goal: "Learn Javascript",
        dueDate: "August 21st, 2022",
        progress: 100,
      },
    ]);
  });

  return (
    <>
      <GoalsContainer userGoals={userGoals} />
    </>
  );
};

export const gridItemStyle: React.CSSProperties = {
  padding: "1rem",
  borderTop: "2px solid #E2E8F0",
};
export interface IGoalsContainerProps {
  userGoals: UserGoal[];
}
export const GoalsContainer = ({ userGoals }: IGoalsContainerProps) => {
  return (
    <Box style={{ width: "100%", height: "100%" }}>
      <Box style={{ width: "100%", textAlign: "right" }}>
        <Button backgroundColor={"brand.500"} style={{ color: "white", margin: '1rem' }}>
          Add Goal <AddIcon style={{}} />
        </Button>
      </Box>
      <Grid
        templateColumns="repeat(3, 1fr)"
        style={{
          border: "2px solid #E2E8F0",
          borderRadius: "10px",
          padding: "1rem",
        }}
      >
        <GridItem style={{ padding: "1rem", fontWeight: "bold" }}>
          Goal
        </GridItem>
        <GridItem style={{ padding: "1rem", fontWeight: "bold" }}>Due</GridItem>
        <GridItem
          style={{ padding: "1rem", textAlign: "right", fontWeight: "bold" }}
        >
          Progress
        </GridItem>
        {userGoals.map((item, index) => {
          return (
            <>
              <GoalsItem
                key={`goal-${index}`}
                goal={item.goal}
                dueDate={item.dueDate}
                progress={item.progress}
              />
            </>
          );
        })}
      </Grid>
    </Box>
  );
};

export const GoalsItem = ({ goal, dueDate, progress }: UserGoal) => {
  return (
    <>
      <GridItem style={gridItemStyle}>{goal}</GridItem>
      <GridItem style={gridItemStyle}>{dueDate}</GridItem>
      <GridItem style={{ ...gridItemStyle, textAlign: "right" }}>
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

export default GoalsPage;
