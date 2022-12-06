import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Application, Mentor, Profile } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import Avatar from "~/components/Avatar";
import Button from "~/components/Buttons/IconButton";
import Field from "~/components/FormElements/Field";
import { H3, Paragraph } from "~/components/Typography";
import { routes } from "~/routes";
import { sendEmail } from "~/utils/email.server";
import { requireUser } from "~/utils/user.session.server";

interface LoaderData {
  data: {
    mentor: Mentor & {
      profile: Omit<Profile, "password"> | null;
    };
  };
}

export const action: ActionFunction = async ({ request }) => {
  const requestText = await request.text();
  const form = new URLSearchParams(requestText);
  const user = await requireUser(request);
  const values = {
    mentorEmail: form.get("mentorEmail") ?? "",
    mentorFirstName: form.get("mentorFirstName") ?? "",
    mentorLastName: form.get("mentorLastName") ?? "",
    mentorId: form.get("mentorId") ?? "",
    desires: form.get("desires") ?? "",
    goal: form.get("goal") ?? "",
    progress: form.get("progress") ?? "",
    deadline: form.get("deadline") ?? "",
    questions: form.get("questions") ?? "",
  };
  const prisma = new PrismaClient();
  await prisma.$connect();
  let application: Application | null = null;
  const baseUrl = new URL(request.url).origin;
  try {
    application = await prisma.application.create({
      data: {
        menteeId: user.id,
        mentorId: values.mentorId,
        desires: values.desires,
        goal: values.goal,
        progress: values.progress,
        deadline: values.deadline,
        questions: values.questions,
      },
    });
  } catch (e) {
    if (e instanceof Error) {
      console.error("Failed to create mentee application", e);
    }
    return null;
  } finally {
    prisma.$disconnect();
  }
  try {
    await sendEmail({
      fromName: `${user.firstName} ${user.lastName} via Hoots`,
      toName: values.mentorFirstName,
      email: values.mentorEmail,
      subject: "Hoots - New Mentee Application",
      template: "new-mentee-application",
      variables: {
        firstName: values.mentorFirstName,
        menteeFirstName: user.firstName,
        menteeLastName: user.lastName,
        applicationLink: `${baseUrl}/${routes.applicationsInbox}/${application.id}`,
      },
    });
  } catch (e) {
    if (e instanceof Error) {
      console.error("Failed to send mentee application", e);
    }
    return null;
  }
  return application;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireUser(request);
  const baseUrl = new URL(request.url).origin;
  const mentor = await fetch(
    `${baseUrl}/.netlify/functions/get-mentor?id=${params.id}`
  )
    .then((mentors) => mentors.json())
    .catch(() => {
      console.error("Failed to get mentor, please try again in a few minutes.");
    });

  return json({
    data: {
      mentor: mentor as Mentor & {
        profile: Profile | null;
      },
    },
  });
};

export default function Apply() {
  const { data } = useLoaderData<LoaderData>();
  const { mentor } = data;
  const mentorFirstName = mentor.name.split(" ")[0] ?? "your mentor";
  const transition = useTransition();
  const actionData = useActionData<Application | null>();
  const isSubmitted = transition.state !== "idle" || !!actionData?.id;
  return (
    <div>
      <div className="space-y-8 mx-auto max-w-lg py-12 px-6">
        <H3 className="font-bold">Mentorship Application</H3>
        <div className="flex">
          <Avatar src={mentor.img ?? undefined} />
          <Paragraph className="text-lg text-gray-600 dark:text-gray-200 self-center ml-3">
            {mentor.name}
          </Paragraph>
        </div>
        <div className="bg-gray-200 dark:bg-gray-800 p-5">
          <Paragraph>Details</Paragraph>
          <ul className="list-disc pl-5">
            <li>
              Your application will be sent to {mentorFirstName} for review.
              Make sure to include as much detail as possible.
            </li>
            <li>
              You will receive an email after your application has been reviewed
              by {mentorFirstName}.
            </li>
            <li>
              Pricing and meeting details will be discussed upon approval.
            </li>
          </ul>
        </div>
        <Form method="post">
          <input hidden name="mentorEmail" value={mentor.profile?.email} />
          <input
            hidden
            name="mentorFirstName"
            value={mentor.profile?.firstName}
          />
          <input
            hidden
            name="mentorLastName"
            value={mentor.profile?.lastName}
          />
          <input hidden name="mentorId" value={mentor.id} />
          <div className="space-y-3">
            <Field
              name="desires"
              type="textarea"
              label="Desires"
              subLabel="Describe the qualities you look for in a mentor and any specific help you need."
              isDisabled={isSubmitted}
              isRequired
            />
            <Field
              name="goal"
              type="textarea"
              label="Goal"
              subLabel="Describe the goal of your mentorship."
              isDisabled={isSubmitted}
              isRequired
            />
            <Field
              name="progress"
              type="textarea"
              label="Progress"
              subLabel="Describe your current situation and actions you've taken to
                reach your goal."
              isDisabled={isSubmitted}
              isRequired
            />
            <Field
              name="deadline"
              type="input"
              label="Deadline"
              subLabel="Do you have a target date for your goal?"
              isDisabled={isSubmitted}
              isRequired
            />
            <Field
              name="questions"
              type="textarea"
              label="Questions"
              subLabel={`Do you have any questions for ${mentorFirstName}?`}
              isDisabled={isSubmitted}
            />
          </div>
          <div className={`pt-5 ${isSubmitted ? "hidden" : ""}`}>
            <Button
              rightIcon={
                <FontAwesomeIcon
                  icon={faPaperPlane}
                  style={{ marginLeft: "0.5em" }}
                />
              }
              variant="primary"
              className="float-right"
              type="submit"
            >
              Apply
            </Button>
          </div>
          <div className={`pt-5 ${!isSubmitted ? "hidden" : ""}`}>
            <Paragraph>
              Submitted! We sent{" "}
              {mentorFirstName} your application.
            </Paragraph>
          </div>
        </Form>
      </div>
    </div>
  );
}
