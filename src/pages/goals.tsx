import { Box, Grid } from "@chakra-ui/react";

const GoalsPage = () => {
  return (
    <>
      <GoalsContainer />
    </>
  );
};

export const GoalsContainer = () => {
  return (
    <Box>
      <Grid>
        <GoalsItem goals={"my first goal"} dueDate={"10/20/22"} progress={10} />
      </Grid>
    </Box>
  );
};

export interface IGoalsItemProps {
  goals: string;
  dueDate: string;
  progress: number;
}

export const GoalsItem = ({ goals, dueDate, progress }: IGoalsItemProps) => {
  return <Box>Hello</Box>;
};

export default GoalsPage;
