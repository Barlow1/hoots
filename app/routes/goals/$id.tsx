import * as React from "react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { faFloppyDisk, faXmark } from "@fortawesome/free-solid-svg-icons";
import {
  Box,
  Button,
  Checkbox,
  Heading,
  Drawer,
  DrawerBody,
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
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Show,
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  useFetcher,
  useLoaderData,
  useSubmit,
  useTransition,
} from "@remix-run/react";
import type { Goal, GoalMilestone } from "@prisma/client";
import { formatDateDisplay } from "~/utils/dates";
import { requireUser } from "~/utils/user.session.server";

type Route = {
  data: { goal: Goal };
  params: { id: string };
};

export const loader: LoaderFunction = async ({ params, request }) => {
  await requireUser(request);
  const baseUrl = new URL(request.url).origin;
  const goal = await fetch(
    `${baseUrl}/.netlify/functions/get-goals?id=${params.id}`
  )
    .then((goals) => goals.json())
    .catch(() => {
      console.error("Failed to get goal, please try again in a few minutes.");
    });

  return json({ data: { goal: goal as Goal } });
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
  console.log("method", request.method);

  if (values.formType === FormType.DELETE) {
    options = {
      method: "DELETE",
      body: JSON.stringify({
        id: values.milestoneId,
      }),
    };
  } else if (values.formType === FormType.NEW) {
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
        completed: values.completed,
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
    console.log("options", options);
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
    // eslint-disable-next-line no-shadow
  } catch (error) {
    console.error(error);
  }
  return json({
    error,
    data,
  });
};

const convertFormToMilestone = (form: FormData): GoalMilestone => {
  const milestone = Object.fromEntries(form);
  return {
    id: String(milestone.id),
    date: String(milestone.date),
    completed: Boolean(milestone.completed === "true"),
    name: String(milestone.name),
    notes: String(milestone.notes),
  };
};

function MilestonePage() {
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

  const sortedMilestones = [...(data.goal?.milestones ?? [])].reverse();

  const milestoneBeingEdited = React.useMemo(
    () =>
      data.goal?.milestones.find(
        (milestone) => milestone.id === milestoneBeingEditedId
      ),
    [milestoneBeingEditedId, data.goal?.milestones]
  );

  if (!data.goal || data.goal === undefined) {
    return <Heading color="red">Error Grabbing Goal Data</Heading>;
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
          borderRadius: "10px",
          padding: "1rem",
          minWidth: "20%",
          borderWidth: "2px",
          borderStyle: "solid",
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
          <Box>
            Due:
            {formatDateDisplay(data.goal?.dueDate) ?? "-"}
          </Box>
          <Box>
            Notes:
            <Box>{data.goal?.notes ?? "-"}</Box>
          </Box>
        </Stack>
      </Box>
      <Box style={{ minWidth: "70%", height: "100%" }}>
        <Box style={{ width: "100%", textAlign: "right" }}>
          <Button
            backgroundColor="brand.500"
            _hover={{ bg: "brand.200" }}
            style={{ color: "white", margin: "1rem 1rem 1rem 0" }}
            onClick={() => openDrawer(undefined)}
          >
            Add Milestone <AddIcon style={{ marginLeft: "0.5em" }} />
          </Button>
        </Box>
        <TableContainer whiteSpace={{ md: "nowrap", base: "unset" }}>
          <Table
            style={{
              borderWidth: "2px",
              borderStyle: "solid",
              borderRadius: "10px",
              padding: "1rem",
              minWidth: "20%",
            }}
          >
            <Thead>
              <Tr>
                <Th>
                  <Show above="md">Completed</Show>
                </Th>
                <Th>Milestone</Th>
                <Th display={{ md: "block", base: "none" }}>Due</Th>
              </Tr>
            </Thead>
            <Tbody>
              {transition.submission &&
                pendingSubmissionFormType === FormType.NEW && (
                  <MilestoneItem
                    item={convertFormToMilestone(
                      transition.submission.formData
                    )}
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
                    optimisticItem = convertFormToMilestone(
                      transition.submission.formData
                    );
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
        formType={milestoneBeingEditedId ? FormType.EDIT : FormType.NEW}
        milestoneBeingEdited={milestoneBeingEdited}
      />
    </Box>
  );
}

export interface MilestoneItemProps {
  openDrawer: Function;
  onCheck: any;
  item: GoalMilestone;
}

export function MilestoneItem({
  openDrawer,
  onCheck,
  item,
}: MilestoneItemProps) {
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
            // eslint-disable-next-line no-param-reassign
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
      <Td display={{ md: "block", base: "none" }}>
        {formatDateDisplay(item.date)}
      </Td>
    </Tr>
  );
}

export interface MilestoneDrawerProps {
  goalId: string | undefined;
  isDrawerOpen: boolean;
  onDrawerClose: any;
  formType: FormType;
  milestoneBeingEdited: GoalMilestone | undefined;
}

// eslint-disable-next-line no-shadow
export enum FormType {
  NEW = "New",
  EDIT = "Edit",
  COMPLETED = "Completed",
  DELETE = "Delete",
}

export function MilestoneDrawer({
  goalId,
  isDrawerOpen,
  onDrawerClose,
  formType,
  milestoneBeingEdited,
}: MilestoneDrawerProps) {
  const deleteFetcher = useFetcher();

  return (
    <Drawer
      isOpen={isDrawerOpen}
      placement="right"
      onClose={onDrawerClose}
      size="md"
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
            <input
              hidden
              name="completed"
              value={String(milestoneBeingEdited?.completed)}
            />
            <Stack spacing={3}>
              <FormLabel>Name</FormLabel>
              <Input
                name="name"
                placeholder="Enter new milestone"
                defaultValue={milestoneBeingEdited?.name}
              />
              <FormControl>
                <FormLabel>Due</FormLabel>
                <Input
                  name="date"
                  type="date"
                  placeholder="Enter Due Date"
                  defaultValue={milestoneBeingEdited?.date}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  name="notes"
                  style={{ minHeight: "8rem" }}
                  placeholder="Enter notes for your milestone"
                  defaultValue={milestoneBeingEdited?.notes}
                />
              </FormControl>
              <Button colorScheme="blue" type="submit" onClick={onDrawerClose}>
                Save
                <FontAwesomeIcon
                  style={{ marginLeft: "1rem" }}
                  icon={faFloppyDisk}
                />
              </Button>
            </Stack>
          </Form>

          <deleteFetcher.Form method="delete">
            <Stack marginTop={3} direction="row">
              <Button
                colorScheme="gray"
                mr={3}
                onClick={onDrawerClose}
                w="100%"
              >
                Cancel
                <FontAwesomeIcon
                  style={{ marginLeft: "1rem" }}
                  icon={faXmark}
                />
              </Button>
              <Button
                style={{ backgroundColor: "#E53E3E", color: "white" }}
                type="submit"
                onClick={onDrawerClose}
                w="100%"
              >
                <input hidden name="goalId" value={goalId} />
                <input
                  hidden
                  name="milestoneId"
                  value={milestoneBeingEdited?.id}
                />
                <input hidden name="formType" value={FormType.DELETE} />
                Delete
                <DeleteIcon style={{ color: "white", marginLeft: "1rem" }} />
              </Button>
            </Stack>
          </deleteFetcher.Form>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
export default MilestonePage;
