import * as React from "react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link as NavLink, useLoaderData } from "@remix-run/react";
import type { Goal, Mentor, Profile } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAdd,
  /* faArrowUpFromBracket, */ faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { requireUser } from "~/utils/user.session.server";
import { formatDateDisplay } from "~/utils/dates";
import { calculateGoalProgress } from "~/utils/calculateGoalProgress";
import MenuButton from "~/components/Buttons/MenuButton";
import Avatar from "~/components/Avatar";
import Button from "~/components/Buttons/IconButton";
import { Paragraph } from "~/components/Typography";
import { routes } from "../../routes";
import { GoalsDialog } from "../../components/goalsDialog";

export const loader: LoaderFunction = async ({ request, context }) => {
  const baseUrl = new URL(request.url).origin;
  const user = await requireUser(request);
  const goals = await fetch(
    `${baseUrl}/.netlify/functions/get-goals?userId=${user?.id}`
  )
    .then((response) => response.json())
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
    await fetch(
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

function GoalsPage() {
  const { goals, userMentors, usersWithSharedGoals } = useLoaderData();
  return (
    <GoalsContainer
      userGoals={goals}
      userMentors={userMentors}
      usersWithSharedGoals={usersWithSharedGoals}
    />
  );
}

export interface IGoalsContainerProps {
  userGoals: Goal[];
  userMentors?: Mentor[];
  usersWithSharedGoals?: Profile[];
  isReadOnly?: boolean;
}
export function GoalsContainer({
  userGoals,
  userMentors,
  usersWithSharedGoals,
  isReadOnly,
}: IGoalsContainerProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const [editingIndex, setEditingIndex] = React.useState<string>("");
  const openDialog = (param: string) => {
    setEditingIndex(param);
    setIsDialogOpen(true);
  };
  // const onDelete = (param: number) => {};

  return (
    <div style={{ width: "90%", height: "100%", margin: "auto" }}>
      <div className="flex flex-wrap-reverse justify-between pb-5">
        {!isReadOnly && usersWithSharedGoals?.length ? (
          <MenuButton
            rightIcon={
              <FontAwesomeIcon icon={faChevronDown} className="ml-2" />
            }
            options={usersWithSharedGoals?.map((user) => ({
              title: `${user.firstName} ${user.lastName}`,
              href: { to: `shared/${user.id}` },
              icon: <Avatar size="xs" src={user.img ?? undefined} />,
            }))}
            label="Goals Shared Menu"
            className="w-full mx-0 md:w-auto"
            menuClassName="w-full md:w-auto"
          >
            Shared with me
          </MenuButton>
        ) : (
          <div />
        )}
        {!isReadOnly && (
          <Button
            onClick={() => openDialog("")}
            rightIcon={<FontAwesomeIcon icon={faAdd} className="ml-2" />}
            variant="primary"
            className="w-full md:w-auto mx-0"
          >
            Add Goal
          </Button>
        )}
      </div>
      <div className="overflow-hidden bg-white dark:bg-zinc-900 shadow sm:rounded-md dark:shadow-zinc-600">
        <ul className="divide-y divide-gray-200 dark:divide-zinc-600">
          {userGoals.length > 0 ? (
            userGoals.map((goal) => <NewGoalItem key={goal.id} goal={goal} />)
          ) : (
            <Paragraph className="text-center">
              No goals found. 😢 Add one now!
            </Paragraph>
          )}
        </ul>
      </div>
      <GoalsDialog
        userGoals={userGoals}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        id={editingIndex}
      />
    </div>
  );
}

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

// export function GoalsItem({
//   name,
//   dueDate,
//   progress,
//   id,
//   openDialog,
//   onDelete,
//   userMentors,
//   sharedWithMentorIDs,
//   isReadOnly,
// }: GoalsItemProps) {
//   const utcDate = formatDateDisplay(dueDate);
//   return (
//     <Tr
//       _focus={{ bgColor: "blackAlpha.50", cursor: "pointer" }}
//       display={{
//         md: "revert",
//         base: "flex",
//       }}
//       flexDirection={{
//         md: "unset",
//         base: "column",
//       }}
//     >
//       <Td
//         display={{
//           md: "revert",
//           base: "flex",
//         }}
//         flexDirection={{
//           md: "unset",
//           base: "column",
//         }}
//       >
//         <Link as={NavLink} to={`${routes.goals}/${id}`} color="brand.900">
//           <Text fontWeight="bold">{name}</Text>
//         </Link>
//       </Td>
//       <Td>{utcDate}</Td>
//       <Td>
//         {progress < 100 && (
//           <>
//             <Progress
//               colorScheme="green"
//               size="sm"
//               style={{ borderRadius: "500px" }}
//               value={progress}
//             />
//             {progress}%
//           </>
//         )}
//         {progress === 100 && "Complete 🎉"}
//       </Td>
//       {!isReadOnly && (
//         <Td
//           style={{
//             display: "flex",
//             padding: "1rem",
//             justifyContent: "space-evenly",
//             alignContent: "center",
//           }}
//           borderBottom={{
//             md: "0",
//             base: "2px solid #E2E8F0",
//           }}
//         >
//           <Menu>
//             <MenuButton
//               name="shareGoal"
//               as={Button}
//               colorScheme="blue"
//               variant="ghost"
//               aria-label="Share with mentor"
//             >
//               <FontAwesomeIcon
//                 icon={faArrowUpFromBracket}
//                 style={{ color: "grey" }}
//               />
//             </MenuButton>
//             <MenuList>
//               {userMentors?.length ? (
//                 userMentors.map((mentorOption) => {
//                   const isAlreadyShared = sharedWithMentorIDs?.includes(
//                     mentorOption.id
//                   );
//                   return (
//                     <Form method="post" name="share" key={mentorOption.id}>
//                       <input hidden name="goalId" value={id} />
//                       <input hidden name="mentorId" value={mentorOption.id} />
//                       <input hidden name="method" value="share" />
//                       <MenuItem
//                         icon={
//                           <Avatar
//                             src={mentorOption.img ?? undefined}
//                             size="xs"
//                           />
//                         }
//                         isDisabled={isAlreadyShared}
//                         as={Button}
//                         type="submit"
//                       >
//                         {mentorOption.name}
//                         {isAlreadyShared && (
//                           <Text
//                             fontSize="xs"
//                             // eslint-disable-next-line react-hooks/rules-of-hooks
//                             color={useColorModeValue(
//                               "grey.200",
//                               "whiteAlpha.700"
//                             )}
//                           >
//                             Shared
//                           </Text>
//                         )}
//                       </MenuItem>
//                     </Form>
//                   );
//                 })
//               ) : (
//                 <Text marginLeft={5}>No mentors found</Text>
//               )}
//             </MenuList>
//           </Menu>
//           <Button
//             colorScheme="blue"
//             name="editGoal"
//             onClick={() => openDialog(id)}
//             variant="ghost"
//             aria-label="Edit Goal"
//           >
//             <EditIcon style={{ color: "grey" }} />
//           </Button>
//           <Form method="delete">
//             <input hidden name="goalId" value={id} />
//             <input hidden name="method" value="delete" />
//             <Button
//               colorScheme="red"
//               type="submit"
//               name="deleteGoal"
//               variant="ghost"
//               aria-label="Delete Goal"
//             >
//               <DeleteIcon style={{ color: "grey" }} />
//             </Button>
//           </Form>
//         </Td>
//       )}
//     </Tr>
//   );
// }

function NewGoalItem({ goal }: { goal: Goal }) {
  const utcDate = formatDateDisplay(goal.dueDate);
  const progress = calculateGoalProgress(goal.milestones) ?? 0;
  return (
    <li key={goal.id}>
      <NavLink
        to={`${routes.goals}/${goal.id}`}
        className="block hover:bg-gray-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
      >
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <p className="truncate text-sm font-medium text-brand-600">
              {goal.name}
            </p>
          </div>
          <div className="mt-2 sm:flex sm:justify-between">
            <div className="sm:flex">
              {progress < 100 && (
                <div className="sm:w-32 w-full">
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1 dark:bg-gray-700">
                    <div
                      className="bg-green-600 h-1.5 rounded-full dark:bg-green-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  {progress}%
                </div>
              )}
              {progress === 100 && "Complete 🎉"}
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-300 sm:mt-0">
              <p>
                Due by <time dateTime={goal.dueDate}>{utcDate}</time>
              </p>
            </div>
          </div>
        </div>
      </NavLink>
    </li>
  );
}

export default GoalsPage;
