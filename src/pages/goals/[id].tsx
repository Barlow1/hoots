import * as React from "react";
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";
import {
  Box,
  Button,
  Checkbox,
  Grid,
  GridItem,
  Heading,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Input,
} from "@chakra-ui/react";
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

  const goal: UserGoal = {
    name: "Get an internship",
    dueDate: "June 10th, 2023",
    progress: 0,
  };

  return { goal: goal as UserGoal };
};

const MilestonePage = () => {
  const { data } = useMatch<Route>();
  const [goal, setGoal] = React.useState<UserGoal>(data.goal ?? {});
  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(false);
  const [editingIndex, setEditingIndex] = React.useState<number | undefined>(
    undefined
  );

  const openDrawer = (param: number | undefined) => {
    setEditingIndex(param);
    setIsDrawerOpen(true);
  };
  const onDrawerClose = () => {
    setIsDrawerOpen(false);
  };
  const onDelete = (param: number) => {
    const newUserGoal: UserGoal = { ...goal };
    if (newUserGoal.milestones) {
      newUserGoal.milestones.splice(param, 1);
    }
    setGoal(newUserGoal);
  };
  if (!goal || goal === undefined) {
    return <Heading color={"red"}>Error Grabbing Goal Data</Heading>;
  }

  return (
    <Box>
      <Box style={{ width: "90%", height: "100%", margin: "auto" }}>
        <Box style={{ width: "100%", textAlign: "left" }}>
          <Button
            backgroundColor={"brand.500"}
            _hover={{ bg: "brand.200" }}
            style={{ color: "white", margin: "1rem" }}
            onClick={() => openDrawer(undefined)}
          >
            Add Milestone <AddIcon style={{ marginLeft: "0.5em" }} />
          </Button>
        </Box>
        <Grid
          templateColumns="repeat(9, 1fr)"
          style={{
            border: "2px solid #E2E8F0",
            borderRadius: "10px",
            padding: "0rem 1rem 1rem 1rem",
            width: "50%",
          }}
        >
          <GridItem colSpan={1} style={{ padding: "1rem" }}></GridItem>
          <GridItem colSpan={4} style={{ padding: "1rem", fontWeight: "bold" }}>
            Milestone
          </GridItem>
          <GridItem colSpan={4} style={{ padding: "1rem", fontWeight: "bold" }}>
            Due
          </GridItem>
          {goal.milestones &&
            goal.milestones.map((item, index) => {
              return (
                <MilestoneItem
                  key={`milestone-${index}`}
                  name={item.name ?? ""}
                  dueDate={item.date ?? ""}
                  completed={item.completed ?? false}
                  index={index}
                  openDrawer={openDrawer}
                  onDelete={onDelete}
                />
              );
            })}
          {!goal.milestones && (
            <>
              <GridItem colSpan={1} style={gridItemStyle}></GridItem>
              <GridItem colSpan={4} style={gridItemStyle}>
                -
              </GridItem>
              <GridItem colSpan={4} style={gridItemStyle}>
                -
              </GridItem>
            </>
          )}
        </Grid>
      </Box>
      <Drawer isOpen={isDrawerOpen} placement="right" onClose={onDrawerClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Create your account</DrawerHeader>

          <DrawerBody>
            <Input placeholder="Type here..." />
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onDrawerClose}>
              Cancel
            </Button>
            <Button colorScheme="blue">Save</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
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
  openDrawer: Function;
  onDelete: Function;
}

export const MilestoneItem = ({
  name,
  dueDate,
  completed,
  index,
  openDrawer,
  onDelete,
}: MilestoneItemProps) => {
  return (
    <>
      <GridItem colSpan={1} style={gridItemStyle}>
        <Checkbox isChecked={completed} />
      </GridItem>
      <GridItem colSpan={4} style={gridItemStyle}>
        {name}
      </GridItem>
      <GridItem colSpan={4} style={gridItemStyle}>
        {dueDate}
      </GridItem>
    </>
  );
};

export default MilestonePage;
