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
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
  useMediaQuery,
  Show,
} from "@chakra-ui/react";
import { UserGoal } from ".";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { routes } from "../../routes";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import {
  Form,
  useFetcher,
  useLoaderData,
  useSubmit,
  useTransition,
} from "@remix-run/react";
import { Goal, GoalMilestone } from "@prisma/client";

type Route = {
  data: { goal: Goal };
  params: { id: string };
};

export const loader: LoaderFunction = async ({ params, request }) => {
  const baseUrl = new URL(request.url).origin;
  const goal = await fetch(
    `${baseUrl}/.netlify/functions/get-goals?id=${params.id}`
  )
    .then((goals) => goals.json())
    .catch(() => {
      console.error("Failed to get goal, please try again in a few minutes.");
    });

  return json({ data: { goal: goal as UserGoal } });
};

export const action: ActionFunction = async ({ request }) => {
  const requestText = await request.text();
  const form = new URLSearchParams(requestText);
  const values = {
    name: form.get("name") ?? "",
    date: form.get("date") ?? "",
    notes: form.get("notes") ?? "",
    goalId: form.get("goalId") ?? "",
    formType: form.get("formType") ?? "",
    milestoneId: form.get("milestoneId") ?? "",
    completed: form.get("completed") ?? "",
  };
  const baseUrl = new URL(request.url).origin;
  let error;
  let data;
  let options;

  if (values.formType === FormType.NEW) {
    options = {
      method: "PUT",
      body: JSON.stringify({
        name: values.name,
        notes: values.notes,
        date: values.date,
      }),
    };
  } else if (values.formType === FormType.EDIT) {
    options = {
      method: "PUT",
      body: JSON.stringify({
        name: values.name,
        notes: values.notes,
        date: values.date,
        id: values.milestoneId,
      }),
    };
  } else if (values.formType === FormType.COMPLETED) {
    options = {
      method: "PUT",
      body: JSON.stringify({
        id: values.milestoneId,
        completed: values.completed,
      }),
    };
  }

  try {
    const response = await fetch(
      `${baseUrl}/.netlify/functions/put-milestone?goalId=${values.goalId}&formType=${values.formType}`,
      options
    )
      .then((user) => user.json())
      .catch(() => {
        console.error(
          "Failed to edit milestone, please try again in a few minutes."
        );
      });
    if (response.error) {
      error = response.error;
    } else if (response.goal) {
      data = response.goal;
    }
  } catch (error) {
    console.error(error);
  }
  return json({
    error,
    data,
  });
};

const MilestonePage = () => {
  const { data } = useLoaderData<Route>();
  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(false);
  const [milestoneBeingEditedId, setMilestoneBeingEditedId] = React.useState<
    string | undefined
  >(undefined);

  const openDrawer = (id: string | undefined) => {
    setMilestoneBeingEditedId(id);
    setIsDrawerOpen(true);
  };
  const onDrawerClose = () => {
    setIsDrawerOpen(false);
  };
  const onDelete = (param: number) => {};

  const submit = useSubmit();
  const transition = useTransition();
  const pendingSubmissionFormType = transition.submission
    ? transition.submission.formData.get("formType")
    : undefined;

  const onCheck = (
    e: React.ChangeEvent<HTMLInputElement>,
    milestoneId: string
  ) => {
    const formData = new FormData(e.target.form ?? undefined);
    formData.set("goalId", data.goal.id);
    formData.set("milestoneId", milestoneId);
    formData.set("formType", FormType.COMPLETED);
    formData.set("completed", String(e.target.checked));

    submit(formData, { replace: true, method: "post" });
  };

  if (!data.goal || data.goal === undefined) {
    return <Heading color={"red"}>Error Grabbing Goal Data</Heading>;
  }

  const sortedMilestones = [...data.goal?.milestones].reverse();

  const milestoneBeingEdited = React.useMemo(() => {
    return data.goal?.milestones.find(
      (milestone) => milestone.id === milestoneBeingEditedId
    );
  }, [milestoneBeingEditedId, data.goal?.milestones]);

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
          <Box>{data.goal?.name}</Box>
          <Box>Due: {data.goal?.dueDate ?? "-"}</Box>
          <Box>
            Notes:
            <Box>{data.goal?.notes ?? "-"}</Box>
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
        <TableContainer>
          <Table
            style={{
              border: "2px solid #E2E8F0",
              borderRadius: "10px",
              padding: "1rem",
              minWidth: "20%",
            }}
          >
            <Thead>
              <Tr>
                <Th>
                  <Show above={"md"}>Completed</Show>
                </Th>
                <Th>Milestone</Th>
                <Th display={{ md: "block", base: "none" }}>Date</Th>
              </Tr>
            </Thead>
            <Tbody>
              {transition.submission &&
                pendingSubmissionFormType === FormType.NEW && (
                  <MilestoneItem
                    item={
                      Object.fromEntries(transition.submission.formData) as any
                    }
                    openDrawer={openDrawer}
                    onCheck={onCheck}
                  />
                )}
              {data.goal?.milestones &&
                sortedMilestones.map((item) => {
                  let optimisticItem: GoalMilestone | undefined;
                  if (
                    transition.submission &&
                    pendingSubmissionFormType === FormType.EDIT &&
                    item.id === milestoneBeingEditedId
                  ) {
                    optimisticItem = Object.fromEntries(
                      transition.submission.formData
                    ) as any;
                  }
                  return (
                    <MilestoneItem
                      key={`milestone-${item.id}`}
                      item={optimisticItem ?? item}
                      openDrawer={openDrawer}
                      onCheck={onCheck}
                    />
                  );
                })}
              {!data.goal?.milestones ||
                (data.goal?.milestones.length === 0 && !transition.submission && (
                  <Tr>
                    <Td>-</Td>
                    <Td>-</Td>
                    <Td display={{ md: "block", base: "none" }}>-</Td>
                  </Tr>
                ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
      <MilestoneDrawer
        goalId={data.goal.id}
        isDrawerOpen={isDrawerOpen}
        onDrawerClose={onDrawerClose}
        onDelete={onDelete}
        formType={milestoneBeingEditedId ? FormType.EDIT : FormType.NEW}
        milestoneBeingEdited={milestoneBeingEdited}
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
  openDrawer: Function;
  onCheck: any;
  item: GoalMilestone;
}

export const MilestoneItem = ({
  openDrawer,
  onCheck,
  item,
}: MilestoneItemProps) => {
  return (
    <Tr
      _hover={{ bgColor: "blackAlpha.50", cursor: "pointer" }}
      onClick={(e) => {
        if ((e.target as HTMLSpanElement).className.includes("checkbox"))
          return;
        openDrawer(item.id);
      }}
    >
      <Td>
        <Checkbox
          isChecked={item.completed ?? false}
          onChange={(e) => {
            // optimistic UI, remix will revalidate if the update fails
            item.completed = e.target.checked;
            onCheck(e, item.id);
          }}
          inputProps={{
            onClick: (e) => {
              e.stopPropagation();
            },
          }}
        />
      </Td>
      <Td>{item.name}</Td>
      <Td display={{ md: "block", base: "none" }}>{item.date}</Td>
    </Tr>
  );
};

export interface MilestoneDrawerProps {
  goalId: string | undefined;
  isDrawerOpen: boolean;
  onDrawerClose: any;
  onDelete: Function;
  formType: FormType;
  milestoneBeingEdited: GoalMilestone | undefined;
}

export enum FormType {
  NEW = "New",
  EDIT = "Edit",
  COMPLETED = "Completed",
}

export const MilestoneDrawer = ({
  goalId,
  isDrawerOpen,
  onDrawerClose,
  onDelete,
  formType,
  milestoneBeingEdited,
}: MilestoneDrawerProps) => {
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
          {formType === FormType.EDIT ? "Details" : "New Milestone"}
        </DrawerHeader>
        <DrawerBody>
          <Form method="post">
            <input hidden name="goalId" value={goalId} />
            <input hidden name="formType" value={formType} />
            <input hidden name="milestoneId" value={milestoneBeingEdited?.id} />
            <Stack spacing={3}>
              <FormLabel>Name</FormLabel>
              <Input
                name="name"
                placeholder={"Enter new milestone"}
                defaultValue={milestoneBeingEdited?.name}
              />
              <FormControl>
                <FormLabel>Due</FormLabel>
                <Input
                  name="date"
                  placeholder={"Enter due date"}
                  defaultValue={milestoneBeingEdited?.date}
                />
                <FormLabel>Notes</FormLabel>
                <Textarea
                  name="notes"
                  style={{ minHeight: "8rem" }}
                  placeholder={"Enter notes for your milestone"}
                  defaultValue={milestoneBeingEdited?.notes}
                />
              </FormControl>
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
                    onClick={onDrawerClose}
                  >
                    Save
                    <FontAwesomeIcon
                      style={{ marginLeft: "1rem" }}
                      icon={faFloppyDisk}
                    />
                  </Button>
                </Box>

                <Button
                  style={{ backgroundColor: "#E53E3E", color: "white" }}
                  onClick={() => onDelete(goalId)}
                >
                  Delete
                  <DeleteIcon style={{ color: "white", marginLeft: "1rem" }} />
                </Button>
              </Box>
            </Stack>
          </Form>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};
export default MilestonePage;
