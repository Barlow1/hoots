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
  MenuButton,
  Menu,
  MenuItem,
  MenuList,
  Avatar,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from "@chakra-ui/icons";
import * as React from "react";
import { GoalsDialog } from "../../components/goalsDialog";
import { routes } from "../../routes";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import {
  Form,
  Link as NavLink,
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigate,
  useTransition,
} from "@remix-run/react";
import { getUser, requireUser } from "~/utils/user.session";
import {
  Goal,
  GoalMilestone,
  Mentor,
  PrismaClient,
  Profile,
} from "@prisma/client";
import { formatDateDisplay } from "~/utils/dates";
import { calculateGoalProgress } from "~/utils/calculateGoalProgress";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpFromBracket, faEye } from "@fortawesome/free-solid-svg-icons";

type Route = {
  data: { goals: Goal[] };
  params: { id: string };
};

export const loader: LoaderFunction = async ({ request, context }) => {
  const baseUrl = new URL(request.url).origin;
  const user = await requireUser(request);
  const goals = await fetch(
    `${baseUrl}/.netlify/functions/get-goals?userId=${user?.id}`
  )
    .then((goals) => goals.json())
    .catch(() => {
      console.error("Failed to get goals, please try again in a few minutes.");
    });
  const prisma = new PrismaClient();
  try {
    prisma.$connect();
  } catch (e) {
    console.error("Failed to establish db connection", e);
  }
  let mentorProfile = null;
  let usersWithSharedGoals;
  let freshUser;
  if (user) {
    const prisma = new PrismaClient();
    prisma
      .$connect()
      .catch((err) => console.error("Failed to connect to db", err));
    mentorProfile = await prisma.mentor.findUnique({
      where: {
        profileId: user.id,
      },
    });
    freshUser = await prisma.profile.findUnique({
      where: {
        id: user.id,
      },
    });
    if (mentorProfile) {
      console.log("mentor profile id", mentorProfile.id);
      usersWithSharedGoals = await prisma.profile
        .findMany({
          include: {
            goals: true,
          },
          where: {
            goals: {
              some: {
                sharedWithMentors: {
                  some: {
                    id: mentorProfile.id,
                  },
                },
              },
            },
          },
        })
        .catch((e) => {
          console.error("Failed to fetch mentors", e);
        })
        .finally(() => {
          prisma.$disconnect();
        });
    }
  }
  const userMentors = await prisma.mentor
    .findMany({
      where: {
        id: {
          in: freshUser ? freshUser.mentorIDs : user.mentorIDs,
        },
      },
    })
    .catch((e) => {
      console.error("Failed to fetch mentors", e);
    })
    .finally(() => {
      prisma.$disconnect();
    });

  return json({ goals: goals as Goal[], userMentors, usersWithSharedGoals });
};

export const action: ActionFunction = async ({ request }) => {
  const values = Object.fromEntries((await request.formData()).entries());
  const user = await requireUser(request);
  const baseUrl = new URL(request.url).origin;
  console.log("method", request.method);
  if (values.method === "delete") {
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
  } else if (values.method === "post") {
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
  } else if (values.method === "share" && values.goalId && values.mentorId) {
    const prisma = new PrismaClient();
    try {
      prisma.$connect();
    } catch (e) {
      console.error("Failed to establish db connection", e);
    }
    await prisma.goal
      .update({
        where: {
          id: values.goalId.toString(),
        },
        data: {
          sharedWithMentors: {
            connect: {
              id: values.mentorId.toString(),
            },
          },
        },
      })
      .catch((e) => {
        console.error("Failed to fetch mentors", e);
      })
      .finally(() => {
        prisma.$disconnect();
      });
    return { success: true, method: "share" };
  }
  return null;
};

const GoalsPage = () => {
  const { goals, userMentors, usersWithSharedGoals } = useLoaderData();
  return (
    <>
      <GoalsContainer
        userGoals={goals}
        userMentors={userMentors}
        usersWithSharedGoals={usersWithSharedGoals}
      />
    </>
  );
};

export interface IGoalsContainerProps {
  userGoals: Goal[];
  userMentors?: Mentor[];
  usersWithSharedGoals?: Profile[];
  isReadOnly?: boolean;
}
export const GoalsContainer = ({
  userGoals,
  userMentors,
  usersWithSharedGoals,
  isReadOnly,
}: IGoalsContainerProps) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const [editingIndex, setEditingIndex] = React.useState<string>("");
  const openDialog = (param: string) => {
    setEditingIndex(param);
    setIsDialogOpen(true);
  };
  const onDelete = (param: number) => {};

  return (
    <Box style={{ width: "90%", height: "100%", margin: "auto" }}>
      <Box
        display="flex"
        flexWrap="wrap-reverse"
        justifyContent={"space-between"}
      >
        {!isReadOnly && usersWithSharedGoals?.length ? (
          <Menu>
            <MenuButton
              variant={"solid"}
              style={{ margin: "1rem" }}
              rightIcon={<ChevronDownIcon />}
              as={Button}
              width={{ base: "100%", md: "auto" }}
            >
              Shared with me
            </MenuButton>
            <MenuList>
              {usersWithSharedGoals?.map((user) => (
                <NavLink to={`shared/${user.id}`}>
                  <MenuItem
                    icon={
                      <Avatar src={user.img ?? undefined} size={"xs"}></Avatar>
                    }
                    as={Button}
                    type="submit"
                  >
                    {user.firstName} {user.lastName}
                  </MenuItem>
                </NavLink>
              ))}
            </MenuList>
          </Menu>
        ) : (
          <div />
        )}
        {!isReadOnly && (
          <Button
            backgroundColor={"brand.500"}
            _hover={{ bg: "brand.200" }}
            style={{ color: "white", margin: "1rem" }}
            onClick={() => openDialog("")}
            width={{ base: "100%", md: "auto" }}
          >
            Add Goal <AddIcon style={{ marginLeft: "0.5em" }} />
          </Button>
        )}
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
                {!isReadOnly && (
                  <Th
                    style={{
                      padding: "1rem",
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                    display={{ md: "revert", base: "none" }}
                  ></Th>
                )}
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
                    userMentors={userMentors}
                    sharedWithMentorIDs={item.sharedWithMentorIDs}
                    isReadOnly={isReadOnly}
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
  userMentors?: Mentor[];
  sharedWithMentorIDs?: String[];
  isReadOnly?: boolean;
}

export const GoalsItem = ({
  name,
  dueDate,
  progress,
  id,
  openDialog,
  onDelete,
  userMentors,
  sharedWithMentorIDs,
  isReadOnly,
}: GoalsItemProps) => {
  const utcDate = formatDateDisplay(dueDate);
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
      {!isReadOnly && (
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
          <Menu>
            <MenuButton
              name="shareGoal"
              as={Button}
              colorScheme="blue"
              variant="ghost"
              aria-label="Share with mentor"
            >
              <FontAwesomeIcon
                icon={faArrowUpFromBracket}
                style={{ color: "grey" }}
              />
            </MenuButton>
            <MenuList>
              {userMentors?.length ? (
                userMentors.map((mentorOption) => {
                  const isAlreadyShared = sharedWithMentorIDs?.includes(
                    mentorOption.id
                  );
                  return (
                    <Form method="post" name="share">
                      <input hidden name="goalId" value={id} />
                      <input hidden name="mentorId" value={mentorOption.id} />
                      <input hidden name="method" value={"share"} />
                      <MenuItem
                        icon={
                          <Avatar
                            src={mentorOption.img ?? undefined}
                            size={"xs"}
                          ></Avatar>
                        }
                        isDisabled={isAlreadyShared}
                        as={Button}
                        type="submit"
                      >
                        {mentorOption.name}
                        {isAlreadyShared && (
                          <Text
                            fontSize={"xs"}
                            color={useColorModeValue(
                              "grey.200",
                              "whiteAlpha.700"
                            )}
                          >
                            Shared
                          </Text>
                        )}
                      </MenuItem>
                    </Form>
                  );
                })
              ) : (
                <Text marginLeft={5}>No mentors found</Text>
              )}
            </MenuList>
          </Menu>
          <Button
            colorScheme="blue"
            name="editGoal"
            onClick={() => openDialog(id)}
            variant="ghost"
            aria-label="Edit Goal"
          >
            <EditIcon style={{ color: "grey" }} />
          </Button>
          <Form method="delete">
            <input hidden name="goalId" value={id} />
            <input hidden name="method" value={"delete"} />
            <Button
              colorScheme="red"
              type="submit"
              name="deleteGoal"
              variant="ghost"
              aria-label="Delete Goal"
            >
              <DeleteIcon style={{ color: "grey" }} />
            </Button>
          </Form>
        </Td>
      )}
    </Tr>
  );
};

export default GoalsPage;
