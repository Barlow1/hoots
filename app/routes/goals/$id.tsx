import * as React from "react";
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";
import { faFloppyDisk, faXmark } from "@fortawesome/free-solid-svg-icons";
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
  FormControl,
  FormLabel,
  Stack,
  Textarea,
  Divider,
} from "@chakra-ui/react";
import { UserGoal } from ".";
import { Field, FieldAttributes, Form, Formik } from "formik";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { routes } from "../../routes";
import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

type Route = {
  data: { goal: UserGoal };
  params: { id: string };
};

export const loader: LoaderFunction = async ({ params }) => {
  const baseUrl = process.env.URL;
  const goal = await fetch(
    `${baseUrl}/.netlify/functions/get-goals?id=${params.id}`
  )
    .then((goals) => goals.json())
    .catch(() => {
      console.error("Failed to get goal, please try again in a few minutes.");
    });

  return json({ data: { goal: goal as UserGoal } });
};

const MilestonePage = () => {
  const { data } = useLoaderData<Route>();
  const [goal, setGoal] = React.useState<UserGoal | null>(data.goal ?? null);
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
    const newUserGoal: UserGoal = { ...goal } as UserGoal;
    if (newUserGoal.milestones && newUserGoal.milestones[param]) {
      newUserGoal.milestones.splice(param, 1);
    }
    setIsDrawerOpen(false);
    setGoal(newUserGoal);
  };
  const onCheck = (
    e: React.ChangeEvent<HTMLInputElement>,
    param: number | undefined
  ) => {
    if (goal?.milestones && (param || param === 0)) {
      let newMilestones = [...goal?.milestones];
      newMilestones[param].completed = e.target.checked;
      let newGoal: UserGoal = { ...goal, milestones: newMilestones };
      setGoal(newGoal);
    }
  };

  if (!goal || goal === undefined) {
    return <Heading color={"red"}>Error Grabbing Goal Data</Heading>;
  }

  return (
    <Box
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-around",
        width: "100%",
        padding: "2rem",
      }}
    >
      <Box
        style={{
          border: "2px solid #E2E8F0",
          borderRadius: "10px",
          padding: "1rem",
          minWidth: "20%",
        }}
      >
        <Stack spacing={6} style={{ textAlign: "center" }}>
          <Box>
            <Heading as="h1" size="md" noOfLines={1}>
              Goal
            </Heading>
            <Divider />
          </Box>
          <Box>{goal?.name}</Box>
          <Box>Due: {goal?.dueDate ?? "-"}</Box>
          <Box>
            Notes:
            <Box>{goal?.notes ?? "-"}</Box>
          </Box>
        </Stack>
      </Box>
      <Box style={{ minWidth: "70%", height: "100%" }}>
        <Box style={{ width: "100%", textAlign: "left" }}>
          <Button
            backgroundColor={"brand.500"}
            _hover={{ bg: "brand.200" }}
            style={{ color: "white", margin: "1rem 1rem 1rem 0" }}
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
            width: "100%",
          }}
        >
          <GridItem colSpan={1} style={{ padding: "1rem" }}></GridItem>
          <GridItem colSpan={4} style={{ padding: "1rem", fontWeight: "bold" }}>
            Milestone
          </GridItem>
          <GridItem colSpan={4} style={{ padding: "1rem", fontWeight: "bold" }}>
            Due
          </GridItem>
          {goal?.milestones &&
            goal?.milestones.map((item, index) => {
              return (
                <MilestoneItem
                  key={`milestone-${index}`}
                  name={item.name ?? ""}
                  dueDate={item.date ?? ""}
                  completed={item.completed ?? false}
                  index={index}
                  openDrawer={openDrawer}
                  onCheck={onCheck}
                />
              );
            })}
          {(!goal?.milestones || goal?.milestones.length === 0) && (
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
      <MilestoneDrawer
        goal={goal}
        setGoal={setGoal}
        index={editingIndex}
        isDrawerOpen={isDrawerOpen}
        onDrawerClose={onDrawerClose}
        onDelete={onDelete}
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

export interface MilestoneItemProps {
  name: string;
  dueDate: string;
  completed: boolean;
  index: number | undefined;
  openDrawer: Function;
  onCheck: any;
}

export const MilestoneItem = ({
  name,
  dueDate,
  completed,
  index,
  openDrawer,
  onCheck,
}: MilestoneItemProps) => {
  return (
    <>
      <GridItem colSpan={1} style={gridItemStyle}>
        <Checkbox isChecked={completed} onChange={(e) => onCheck(e, index)} />
      </GridItem>
      <GridItem
        colSpan={4}
        style={gridItemStyle}
        onClick={() => openDrawer(index)}
      >
        {name}
      </GridItem>
      <GridItem
        colSpan={4}
        style={gridItemStyle}
        onClick={() => openDrawer(index)}
      >
        {dueDate}
      </GridItem>
    </>
  );
};

export interface MilestoneDrawerProps {
  goal: UserGoal;
  setGoal: Function;
  index: number | undefined;
  isDrawerOpen: boolean;
  onDrawerClose: any;
  onDelete: Function;
}

export const MilestoneDrawer = ({
  goal,
  setGoal,
  index,
  isDrawerOpen,
  onDrawerClose,
  onDelete,
}: MilestoneDrawerProps) => {
  console.log(index, goal?.milestones);
  console.log("result ", (index || index === 0) && goal?.milestones);
  let nameInput =
    (index || index === 0) && goal?.milestones && goal?.milestones[index]
      ? goal?.milestones[index].name
      : "";
  let dateInput =
    (index || index === 0) && goal?.milestones && goal?.milestones[index]
      ? goal?.milestones[index].date
      : "";
  let notesInput =
    (index || index === 0) && goal?.milestones && goal?.milestones[index]
      ? goal?.milestones[index].notes
      : "";
  return (
    <Drawer
      isOpen={isDrawerOpen}
      placement="right"
      onClose={onDrawerClose}
      size={"md"}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>
          {(index || index === 0) && goal?.milestones && goal?.milestones[index]
            ? goal?.milestones[index].name
            : "Create New Milestone"}
        </DrawerHeader>
        <DrawerBody>
          <Formik
            initialValues={{ nameInput, dateInput, notesInput }}
            onSubmit={(values, actions) => {
              setTimeout(() => {
                console.log(index);
                console.log(values);
                let newUserGoal: UserGoal = { ...goal };
                if ((index || index === 0) && newUserGoal.milestones) {
                  newUserGoal.milestones[index] = {
                    ...newUserGoal.milestones[index],
                    name: values.nameInput,
                    date: values.dateInput,
                    notes: values.notesInput,
                  };
                } else {
                  let newMilestones = newUserGoal.milestones
                    ? newUserGoal.milestones
                    : [
                        {
                          name: values.nameInput,
                          date: values.dateInput,
                          notes: values.notesInput,
                          completed: false,
                        },
                      ];
                  newUserGoal = {
                    ...newUserGoal,
                    milestones: newMilestones,
                  };
                }
                setGoal(newUserGoal);
                actions.setSubmitting(false);
                onDrawerClose();
              }, 1000);
            }}
          >
            {(props) => (
              <Form>
                <Stack spacing={3}>
                  <Field name="nameInput">
                    {({ field }: FieldAttributes<any>) => (
                      <FormControl>
                        <FormLabel>Name</FormLabel>
                        <Input {...field} placeholder={"Enter new milestone"} />
                      </FormControl>
                    )}
                  </Field>
                  <Field name="dateInput">
                    {({ field }: FieldAttributes<any>) => (
                      <FormControl>
                        <FormLabel>Due</FormLabel>
                        <Input {...field} placeholder={"Enter due date"} />
                      </FormControl>
                    )}
                  </Field>
                  <Field name="notesInput">
                    {({ field }: FieldAttributes<any>) => (
                      <FormControl>
                        <FormLabel>Notes</FormLabel>
                        <Textarea
                          style={{ minHeight: "8rem" }}
                          {...field}
                          placeholder={"Enter notes for your milestone"}
                        />
                      </FormControl>
                    )}
                  </Field>
                  <Box
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      flexDirection: "row-reverse",
                      marginTop: "2rem",
                    }}
                  >
                    <Box>
                      <Button colorScheme="gray" mr={3} onClick={onDrawerClose}>
                        Cancel
                        <FontAwesomeIcon
                          style={{ marginLeft: "1rem" }}
                          icon={faXmark}
                        />
                      </Button>
                      <Button
                        colorScheme="blue"
                        type="submit"
                        isLoading={props.isSubmitting}
                      >
                        Save
                        <FontAwesomeIcon
                          style={{ marginLeft: "1rem" }}
                          icon={faFloppyDisk}
                        />
                      </Button>
                    </Box>
                    {(index || index === 0) && goal?.milestones && (
                      <Button
                        style={{ backgroundColor: "#E53E3E", color: "white" }}
                        onClick={() => onDelete(index)}
                      >
                        Delete
                        <DeleteIcon
                          style={{ color: "white", marginLeft: "1rem" }}
                        />
                      </Button>
                    )}
                  </Box>
                </Stack>
              </Form>
            )}
          </Formik>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};
export default MilestonePage;
