import { Box, Grid, GridItem } from "@chakra-ui/react";
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
            goal: 'Learn React and Redux',
            dueDate: 'December 1st, 2023',
            progress: 75
        },
        {
            goal: 'Get an internship',
            dueDate: 'June 10th, 2023',
            progress: 100
        },
        {
            goal: 'Create a portfolio page',
            dueDate: 'January 1st, 2023',
            progress: 100
        },
        {
            goal: 'Learn Javascript',
            dueDate: 'August 21st, 2022',
            progress: 100
        },
      ]);
  });

  return (
    <>
      <GoalsContainer userGoals={userGoals} />
    </>
  );
};

export interface IGoalsContainerProps {
  userGoals: UserGoal[];
}
export const GoalsContainer = ({ userGoals }: IGoalsContainerProps) => {
  return (
    <Box>
      <Grid>
        {userGoals.map((item, index) => {
          return (
            <GoalsItem
              key={`goal-${index}`}
              goal={item.goal}
              dueDate={item.dueDate}
              progress={item.progress}
            />
          );
        })}
      </Grid>
    </Box>
  );
};

export const GoalsItem = ({ goal, dueDate, progress }: UserGoal) => {
  return (
    <>
      <GridItem>{goal}</GridItem>
      <GridItem>{dueDate}</GridItem>
      <GridItem>{progress}</GridItem>
    </>
  );
};

export default GoalsPage;
