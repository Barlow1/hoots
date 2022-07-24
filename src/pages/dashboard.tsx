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
import { useUser } from "../components/UserContext";
import { routes } from "../routes";

const Dashboard = () => {
  const { user } = useUser();
  const userObject = {
    industry: "Engineering",
    mentorName: "Ian Mckellen",
    date: "August 1st, 2022",
    nextMilestone: "Learn React and Redux",
    nextMilestoneDate: "August 10th, 2022",
    ...user,
  };
  // userObject.date.
  // const formattedDate =
  return (
    <Grid gap={6}>
      <GridItem boxShadow="2xl" colSpan={12} w="100%" borderRadius="5">
        <Box padding="5">
          <Grid gap={6}>
            <GridItem colSpan={12}>
              <Text fontSize="xl" fontWeight="bold">
              {userObject && `${userObject.firstName} ${userObject.lastName}`}
              </Text>
              <Text fontSize="sm">{userObject.email}</Text>
            </GridItem>
            <GridItem colSpan={3}>
              <Text textColor="#9faec0" fontWeight="bold">
                Mentor
              </Text>
              <Box pt="2" display="flex">
                <Avatar
                  size={"sm"}
                  src={
                    "https://images.unsplash.com/photo-1619946794135-5bc917a27793?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9"
                  }
                />
                <Text
                  justifyContent="center"
                  alignItems="center"
                  display="flex"
                  pl="2"
                  fontSize="sm"
                >
                  {userObject.mentorName}
                </Text>
              </Box>
            </GridItem>
            <GridItem colSpan={3}>
              <Text textColor="#9faec0" fontWeight="bold">
                Industry
              </Text>
              <Text pt="3" m="auto" fontSize="sm">
                {userObject.industry}
              </Text>
            </GridItem>
          </Grid>
        </Box>
      </GridItem>
      <GridItem boxShadow="2xl" w="100%" colSpan={4} borderRadius="5">
        <Grid padding="5" gap={4}>
          <GridItem colSpan={12}>
            <Text fontSize="xl" fontWeight="bold">
              Upcoming Meeting
            </Text>
            <Text fontSize="sm">{userObject.date}</Text>
          </GridItem>
          <GridItem display="flex" justifyContent="center" colSpan={12}>
            <Text fontSize="6xl" fontWeight="bold">
              10
            </Text>
            <Text
              fontSize="xl"
              justifyContent="center"
              alignItems="center"
              display="flex"
              pl="2"
              fontWeight="bold"
            >
              Days away
            </Text>
          </GridItem>
          <GridItem colSpan={12}>
            <Link
              justifyContent="center"
              href={routes.home}
              style={{ textDecoration: "none", display: "flex" }}
              _focus={{ boxShadow: "none" }}
            >
              <Button background="brand.900" textColor="white">
                Add Agenda Items
              </Button>
            </Link>
          </GridItem>
        </Grid>
      </GridItem>
      <GridItem boxShadow="2xl" w="100%" colSpan={4} borderRadius="5">
        <Grid padding="5" gap={4}>
          <GridItem colSpan={12}>
            <Text fontSize="xl" fontWeight="bold">
              Goal Progress
            </Text>
            <Text fontSize="sm">{userObject.nextMilestone}</Text>
          </GridItem>
          <GridItem display="flex" justifyContent="center" colSpan={12}>
            <CircularProgress value={75} color="green.400" size="90px">
              <CircularProgressLabel fontSize="xs">
                75% Complete
              </CircularProgressLabel>
            </CircularProgress>
          </GridItem>
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
      <GridItem boxShadow="2xl" w="100%" colSpan={4} borderRadius="5">
        <Grid padding="5" gap={4}>
          <GridItem colSpan={12}>
            <Text fontSize="xl" fontWeight="bold">
              Next Milestone
            </Text>
            <Text fontSize="sm">{userObject.nextMilestoneDate}</Text>
          </GridItem>
          <GridItem display="flex" justifyContent="center" colSpan={12}>
            <Text fontSize="lg">{userObject.nextMilestone}</Text>
          </GridItem>
          <GridItem colSpan={12}>
            <Link
              justifyContent="center"
              href={routes.home}
              style={{ textDecoration: "none", display: "flex" }}
              _focus={{ boxShadow: "none" }}
            >
              <Button background="brand.900" textColor="white">
                Mark as Complete
              </Button>
            </Link>
          </GridItem>
        </Grid>
      </GridItem>
    </Grid>
  );
};

export default Dashboard;
