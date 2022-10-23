import {
  Box,
  Button,
  Grid,
  GridItem,
  Link,
  Progress,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
} from "@chakra-ui/react";
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";
import * as React from "react";
import { GoalsDialog } from "../../components/goalsDialog";
import { routes } from "../../routes";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import {
  Form,
  Link as NavLink,
  useFetcher,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { getUser, requireUser } from "~/utils/user.session";
import { Goal, GoalMilestone } from "@prisma/client";
import { formatDateDisplay } from "~/utils/dates";
import { calculateGoalProgress } from "~/utils/calculateGoalProgress";

type Route = {
  data: { goals: Goal[] };
  params: { id: string };
};

export const loader: LoaderFunction = async ({ request }) => {
  const baseUrl = new URL(request.url).origin;
  const user = await requireUser(request);
  const goals = await fetch(
    `${baseUrl}/.netlify/functions/get-goals?userId=${user?.id}`
  )
    .then((goals) => goals.json())
    .catch(() => {
      console.error("Failed to get goals, please try again in a few minutes.");
    });
  return json({ goals: goals as Goal[] });
};

export const action: ActionFunction = async ({ request }) => {
  const values = Object.fromEntries((await request.formData()).entries());
  const user = await requireUser(request);
  const baseUrl = new URL(request.url).origin;
  if (request.method === "DELETE") {
    const response = await fetch(
      `${baseUrl}/.netlify/functions/put-goal${
        values.goalId ? `?id=${values.goalId}` : ""
      }`,
      {
        method: "DELETE",
        body: null,
      }
    ).catch(() => {
      console.error(
        "Failed to delete goal, please try again in a few minutes."
      );
    });
  } else if (request.method === "POST") {
    const response = await fetch(
      `${baseUrl}/.netlify/functions/put-goal?userId=${user?.id}${
        values.goalId ? `&id=${values.goalId}` : ""
      }`,
      {
        method: "PUT",
        body: JSON.stringify({
          name: values.nameInput,
          dueDate: values.dateInput,
          notes: values.notesInput,
          progress: values.goalId ? undefined : 0,
          id: values.goalId,
        }),
      }
    )
      .then((goal) => goal.json())
      .catch(() => {
        console.error("Failed to add goal, please try again in a few minutes.");
      });
    if (response.error) {
      console.error(response.error);
    } else if (response.goal) {
      return response.goal;
    }
  }
  return null;
};

const GoalsPage = () => {
  const { goals } = useLoaderData();

  return (
    <>
      <GoalsContainer userGoals={goals} />
    </>
  );
};

export interface IGoalsContainerProps {
  userGoals: Goal[];
}
export const GoalsContainer = ({ userGoals }: IGoalsContainerProps) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const [editingIndex, setEditingIndex] = React.useState<string>("");
  const openDialog = (param: string) => {
    setEditingIndex(param);
    setIsDialogOpen(true);
  };
  const onDelete = (param: number) => {};

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
      {userGoals.length > 0 ? (
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
                <Th style={{ padding: "1rem", fontWeight: "bold" }}>Goal</Th>
                <Th
                  style={{ padding: "1rem", fontWeight: "bold" }}
                  display={{ md: "revert", base: "none" }}
                >
                  Due
                </Th>
                <Th
                  style={{
                    padding: "1rem",
                    textAlign: "right",
                    fontWeight: "bold",
                  }}
                  display={{ md: "revert", base: "none" }}
                >
                  Progress
                </Th>
                <Th
                  style={{
                    padding: "1rem",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                  display={{ md: "revert", base: "none" }}
                ></Th>
              </Tr>
            </Thead>
            <Tbody>
              {userGoals.map((item, index) => {
                return (
                  <GoalsItem
                    key={`goal-${index}`}
                    name={item.name ?? ""}
                    dueDate={item.dueDate ?? ""}
                    progress={calculateGoalProgress(item.milestones) ?? 0}
                    id={item.id}
                    openDialog={openDialog}
                    onDelete={onDelete}
                  />
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
      ) : (
        <Text fontSize="md" textAlign={"center"}>
          No goals found. 😢 Add one now!
        </Text>
      )}
      <GoalsDialog
        userGoals={userGoals}
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
  const utcDate = formatDateDisplay(dueDate);
  const deleteFetcher = useFetcher();
  return (
    <Tr
      _focus={{ bgColor: "blackAlpha.50", cursor: "pointer" }}
      display={{
        md: "revert",
        base: "flex",
      }}
      flexDirection={{
        md: "unset",
        base: "column",
      }}
    >
      <Td
        display={{
          md: "revert",
          base: "flex",
        }}
        flexDirection={{
          md: "unset",
          base: "column",
        }}
      >
        <Link as={NavLink} to={`${routes.goals}/${id}`} color={"brand.900"}>
          <Text fontWeight={"bold"}>{name}</Text>
        </Link>
      </Td>
      <Td>{utcDate}</Td>
      <Td>
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
        {progress === 100 && "Complete 🎉"}
      </Td>
      <Td
        style={{
          display: "flex",
          padding: "1rem",
          justifyContent: "space-evenly",
          alignContent: "center",
        }}
        borderBottom={{
          md: "0",
          base: "2px solid #E2E8F0",
        }}
      >
        <Button
          colorScheme="blue"
          name="editGoal"
          onClick={() => openDialog(id)}
          variant="ghost"
        >
          <EditIcon style={{ color: "grey" }} />
        </Button>
        <deleteFetcher.Form method="delete">
          <input hidden name="goalId" value={id} />
          <Button
            colorScheme="red"
            type="submit"
            name="deleteGoal"
            variant="ghost"
          >
            <DeleteIcon style={{ color: "grey" }} />
          </Button>
        </deleteFetcher.Form>
      </Td>
    </Tr>
  );
};

export default GoalsPage;
