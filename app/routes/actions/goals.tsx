/* eslint-disable import/prefer-default-export */

import { PrismaClient } from "@prisma/client";
import { ActionFunction, redirect } from "@remix-run/node";
import { routes } from "~/routes";
import { requireUser } from "~/utils/user.session.server";

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
    return redirect(routes.goals);
  }
  if (values.method === "post") {
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
