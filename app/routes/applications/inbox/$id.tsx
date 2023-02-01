import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Application, Mentor, Profile } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useLoaderData, useTransition } from "@remix-run/react";
import Avatar from "~/components/Avatar";
import Button from "~/components/Buttons/IconButton";
import { H3, Paragraph } from "~/components/Typography";
import { routes } from "~/routes";
import { sendEmail } from "~/utils/email.server";
import { getUserSession, requireUser } from "~/utils/user.session.server";

interface LoaderData {
  data: {
    application: Application | null;
    mentee: Profile | null;
  };
}

// eslint-disable-next-line no-shadow
export enum ApplicationStatuses {
  UNREAD = "UNREAD",
  DENIED = "DENIED",
  APPROVED = "APPROVED",
}

export const loader: LoaderFunction = async ({ params, request }) => {
  const user = await requireUser(request);
  const baseUrl = new URL(request.url).origin;
  let application: Application | null = null;
  let mentor: Mentor | null = null;

  try {
    const prisma = new PrismaClient();
    await prisma.$connect();
    application = await prisma.application.findUnique({
      where: {
        id: params.id,
      },
    });
    mentor = await prisma.mentor.findUnique({
      where: {
        profileId: user.id,
      },
    });
  } catch (e) {
    console.error("Failed to fetch application", e);
  }
  if (mentor?.id !== application?.mentorId) {
    // a user shouldn't ever get to an application that isn't theirs but
    // let's sign out & return to the login page anyway
    const session = await getUserSession(request);
    throw redirect(
      `/login?returnTo=${encodeURIComponent(new URL(request.url).toString())}`,
      {
        headers: {
          "Set-Cookie": await session.destroy(),
        },
      }
    );
  }
  const response = await fetch(
    `${baseUrl}/.netlify/functions/get-user?id=${application?.menteeId}`
  )
    .then((mentee) => mentee.json())
    .catch(() => {
      console.error("Failed to get mentee, please try again in a few minutes.");
    });

  return {
    data: {
      application,
      mentee: response,
    },
  };
};

export const action: ActionFunction = async ({ request }) => {
  const requestText = await request.text();
  const form = new URLSearchParams(requestText);
  const user = await requireUser(request);
  const baseUrl = new URL(request.url).origin;
  const values = {
    actionType: form.get("actionType") ?? "",
    applicationId: form.get("applicationId") ?? "",
    menteeFirstName: form.get("menteeFirstName") ?? "",
    menteeLastName: form.get("menteeLastName") ?? "",
    menteeEmail: form.get("menteeEmail") ?? "",
  };
  let application: Application | null = null;
  if (values.actionType === ApplicationStatuses.APPROVED) {
    try {
      const prisma = new PrismaClient();
      await prisma.$connect();
      application = await prisma.application
        .update({
          where: {
            id: values.applicationId,
          },
          data: {
            status: ApplicationStatuses.APPROVED,
          },
        })
        .finally(() => {
          prisma.$disconnect();
        });
      await sendEmail({
        fromName: `${user.firstName} ${user.lastName} via Hoots`,
        toName: values.menteeFirstName,
        email: values.menteeEmail,
        subject: "Hoots - Mentorship Application Approved",
        template: "mentor-application-approval",
        version: 'subscribe',
        variables: {
          firstName: values.menteeFirstName,
          mentorFirstName: user.firstName,
          mentorLastName: user.lastName,
          subscriptionLink: `${baseUrl}${routes.browse}/${application.mentorId}/subscribe`,
        },
      });
    } catch (e) {
      console.error("Failed to mark application", e);
    }
    if (application) {
      try {
        const prisma = new PrismaClient();
        await prisma.$connect();
        await prisma.mentor.update({
          where: {
            id: application.mentorId,
          },
          data: {
            mentees: {
              connect: {
                id: application.menteeId,
              },
            },
          },
        });
        await prisma.$disconnect();
      } catch (e) {
        console.error("Failed to assign mentor", e);
      }
    }
  } else if (values.actionType === ApplicationStatuses.DENIED) {
    try {
      const prisma = new PrismaClient();
      await prisma.$connect();
      application = await prisma.application
        .update({
          where: {
            id: values.applicationId,
          },
          data: {
            status: ApplicationStatuses.DENIED,
          },
        })
        .finally(() => {
          prisma.$disconnect();
        });
      await sendEmail({
        fromName: `${user.firstName} ${user.lastName} via Hoots`,
        toName: values.menteeFirstName,
        email: values.menteeEmail,
        subject: "Hoots - Mentorship Application Denied",
        template: "mentor-application-denied",
        variables: {
          firstName: values.menteeFirstName,
          mentorFirstName: user.firstName,
          mentorLastName: user.lastName,
          browseLink: `${baseUrl}${routes.browse}`,
        },
      });
    } catch (e) {
      console.error("Failed to mark application", e);
    }
  }
  return null;
};

export default function ApplicationInboxRequest() {
  const { data } = useLoaderData<LoaderData>();
  const { mentee } = data;
  const { application } = data;
  const transition = useTransition();
  return (
    <div>
      <div className="space-y-8 mx-auto max-w-lg py-12 px-6">
        <H3 className="font-bold">Mentorship Request</H3>
        <div className="flex">
          <div>
            <Avatar size="md" src={mentee?.img ?? undefined} />{" "}
          </div>
          <Paragraph className="text-lg text-gray-600 dark:text-gray-200 self-center ml-3">
            Submitted by {mentee?.firstName} {mentee?.lastName}{" "}
            {`(${mentee?.email})`}
          </Paragraph>
        </div>
        <div className="bg-gray-200 dark:bg-gray-800 p-5">
          <Paragraph>Details</Paragraph>
          <ul className="list-disc pl-5 dark:text-white">
            <li>
              We&apos;ll send {mentee?.firstName ?? "the applicant"} an email
              letting them know their application status.
            </li>
            <li>
              If accepted, you should email{" "}
              {mentee?.firstName ?? "the applicant"} with next steps, pricing
              and meeting details.
            </li>
          </ul>
        </div>
        <div className="flex flex-col">
          <label className="block text-md font-medium text-gray-700 dark:text-gray-200">
            Industry
          </label>
          <Paragraph>{mentee?.industry ?? "-"}</Paragraph>
          <label className="block text-md font-medium text-gray-700 dark:text-gray-200">
            Experience
          </label>
          <Paragraph>
            {mentee?.experience ?? "-"} {mentee?.experience ? "years" : ""}
          </Paragraph>
          <label className="block text-md font-medium text-gray-700 dark:text-gray-200">
            Bio
          </label>
          <Paragraph>{mentee?.bio ?? "-"}</Paragraph>
          <label className="block text-md font-medium text-gray-700 dark:text-gray-200">
            Desires
          </label>
          <Paragraph>{application?.desires}</Paragraph>
          <label className="block text-md font-medium text-gray-700 dark:text-gray-200">
            Goal
          </label>
          <Paragraph>{application?.goal}</Paragraph>
          <label className="block text-md font-medium text-gray-700 dark:text-gray-200">
            Progress
          </label>
          <Paragraph>{application?.progress}</Paragraph>
          <label className="block text-md font-medium text-gray-700 dark:text-gray-200">
            Deadline
          </label>
          <Paragraph>{application?.deadline}</Paragraph>
          <label className="block text-md font-medium text-gray-700 dark:text-gray-200">
            Questions
          </label>
          <Paragraph>{application?.questions}</Paragraph>
        </div>
        <div
          className={`${"flex flex-row justify-between pt-5"} ${
            application?.status !== ApplicationStatuses.UNREAD ||
            transition.state !== "idle"
              ? "hidden"
              : null
          }`}
          hidden={
            application?.status !== ApplicationStatuses.UNREAD ||
            transition.state !== "idle"
          }
        >
          <Form method="post">
            <input
              hidden
              name="actionType"
              value={ApplicationStatuses.DENIED}
            />
            <input hidden name="applicationId" value={application?.id} />
            <input hidden name="menteeFirstName" value={mentee?.firstName} />
            <input hidden name="menteeLastName" value={mentee?.lastName} />
            <input hidden name="menteeEmail" value={mentee?.email} />
            <Button className="float-right" type="submit" variant="danger">
              Deny{" "}
              <FontAwesomeIcon icon={faXmark} style={{ marginLeft: "0.5em" }} />
            </Button>
          </Form>
          <Form method="post">
            <input
              hidden
              name="actionType"
              value={ApplicationStatuses.APPROVED}
            />
            <input hidden name="applicationId" value={application?.id} />
            <input hidden name="menteeFirstName" value={mentee?.firstName} />
            <input hidden name="menteeLastName" value={mentee?.lastName} />
            <input hidden name="menteeEmail" value={mentee?.email} />
            <Button className="float-right" type="submit" variant="primary">
              Approve{" "}
              <FontAwesomeIcon icon={faCheck} style={{ marginLeft: "0.5em" }} />
            </Button>
          </Form>
        </div>
        <div
          hidden={
            application?.status !== ApplicationStatuses.APPROVED &&
            transition.submission?.formData.get("actionType") !==
              ApplicationStatuses.APPROVED
          }
        >
          <Paragraph textColorClassName="text-green-400">
            Approved <FontAwesomeIcon icon={faCheck} />
          </Paragraph>
        </div>
        <div
          hidden={
            application?.status !== ApplicationStatuses.DENIED &&
            transition.submission?.formData.get("actionType") !==
              ApplicationStatuses.DENIED
          }
        >
          <Paragraph textColorClassName="text-red-500">
            Denied <FontAwesomeIcon icon={faXmark} />
          </Paragraph>
        </div>
      </div>
    </div>
  );
}
