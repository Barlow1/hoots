import {
  Avatar,
  Box,
  Button,
  Flex,
  Text,
  Heading,
  Stack,
  ListItem,
  UnorderedList,
} from "@chakra-ui/react";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Application, prisma, PrismaClient, Profile } from "@prisma/client";
import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import { Form, useLoaderData, useTransition } from "@remix-run/react";
import { routes } from "~/routes";
import { sendEmail } from "~/utils/email.server";
import { getUserSession, requireUser } from "~/utils/user.session";
interface LoaderData {
  data: {
    application: Application | null;
    mentee: Profile | null;
  };
}

enum ApplicationStatus {
  UNREAD = "UNREAD",
  DENIED = "DENIED",
  APPROVED = "APPROVED",
}

export const loader: LoaderFunction = async ({ params, request }) => {
  const user = await requireUser(request);
  const baseUrl = new URL(request.url).origin;
  let application: Application | null = null;
  try {
    const prisma = new PrismaClient();
    await prisma.$connect();
    application = await prisma.application.findUnique({
      where: {
        id: params.id,
      },
    });
  } catch (e) {
    console.error("Failed to fetch application", e);
  }
  if (user.id !== application?.mentorId) {
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
  const mentee = await fetch(
    `${baseUrl}/.netlify/functions/get-user?id=${application?.menteeId}`
  )
    .then((mentee) => mentee.json())
    .catch(() => {
      console.error("Failed to get mentee, please try again in a few minutes.");
    });

  return {
    data: {
      application,
      mentee,
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
  if (values.actionType === ApplicationStatus.APPROVED) {
    try {
      const prisma = new PrismaClient();
      await prisma.$connect();
      application = await prisma.application
        .update({
          where: {
            id: values.applicationId,
          },
          data: {
            status: ApplicationStatus.APPROVED,
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
        variables: {
          firstName: values.menteeFirstName,
          mentorFirstName: user.firstName,
          mentorLastName: user.lastName,
        },
      });
    } catch (e) {
      console.error("Failed to mark application", e);
    }
  } else if (values.actionType === ApplicationStatus.DENIED) {
    try {
      const prisma = new PrismaClient();
      await prisma.$connect();
      application = await prisma.application
        .update({
          where: {
            id: values.applicationId,
          },
          data: {
            status: ApplicationStatus.DENIED,
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
  const mentee = data.mentee;
  const application = data.application;
  const transition = useTransition();
  return (
    <div>
      <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
        <Heading>Mentorship Request</Heading>
        <Flex>
          <Avatar src={mentee?.img ?? undefined} />
          <Text fontSize={"md"} color={"gray.600"} alignSelf={"center"} ml={3}>
            Submitted by {mentee?.firstName} {mentee?.lastName}{" "}
            {`(${mentee?.email})`}
          </Text>
        </Flex>
        <Box bgColor={"gray.200"} p={5}>
          <Text>Details</Text>
          <UnorderedList>
            <ListItem>
              We'll send {mentee?.firstName ?? "the applicant"} an email letting
              them know their application status.
            </ListItem>
            <ListItem>
              If accepted, you should email{" "}
              {mentee?.firstName ?? "the applicant"} with next steps, pricing
              and meeting details.
            </ListItem>
          </UnorderedList>
        </Box>
        <Stack spacing={3}>
          <Box>
            <Text fontSize={"sm"} textColor="grey.400" fontWeight={"bold"}>
              Industry
            </Text>
            <Text>{mentee?.industry ?? "-"}</Text>
          </Box>
          <Box>
            <Text fontSize={"sm"} textColor="grey.400" fontWeight={"bold"}>
              Experience
            </Text>
            <Text>
              {mentee?.experience ?? "-"} {mentee?.experience ? "years" : ""}
            </Text>
          </Box>
          <Box>
            <Text fontSize={"sm"} textColor="grey.400" fontWeight={"bold"}>
              Bio
            </Text>
            <Text>{mentee?.bio ?? "-"}</Text>
          </Box>
          <Box>
            <Text fontSize={"sm"} textColor="grey.400" fontWeight={"bold"}>
              Desires
            </Text>
            <Text>{application?.desires}</Text>
          </Box>
          <Box>
            <Text fontSize={"sm"} textColor="grey.400" fontWeight={"bold"}>
              Goal
            </Text>
            <Text>{application?.goal}</Text>
          </Box>
          <Box>
            <Text fontSize={"sm"} textColor="grey.400" fontWeight={"bold"}>
              Progress
            </Text>
            <Text>{application?.progress}</Text>
          </Box>
          <Box>
            <Text fontSize={"sm"} textColor="grey.400" fontWeight={"bold"}>
              Deadline
            </Text>
            <Text>{application?.deadline}</Text>
          </Box>
          <Box>
            <Text fontSize={"sm"} textColor="grey.400" fontWeight={"bold"}>
              Questions
            </Text>
            <Text>{application?.questions}</Text>
          </Box>
        </Stack>
        <Stack
          spacing={4}
          direction="row"
          align="center"
          justifyContent="space-between"
          pt="5"
          hidden={
            application?.status !== ApplicationStatus.UNREAD ||
            transition.state !== "idle"
          }
        >
          <Form method="post">
            <input hidden name="actionType" value={ApplicationStatus.DENIED} />
            <input hidden name="applicationId" value={application?.id} />
            <input hidden name="menteeFirstName" value={mentee?.firstName} />
            <input hidden name="menteeLastName" value={mentee?.lastName} />
            <input hidden name="menteeEmail" value={mentee?.email} />
            <Button
              backgroundColor={"red.500"}
              _hover={{ bg: "red.800" }}
              style={{ color: "white" }}
              float="right"
              type="submit"
            >
              Deny{" "}
              <FontAwesomeIcon icon={faXmark} style={{ marginLeft: "0.5em" }} />
            </Button>
          </Form>
          <Form method="post">
            <input
              hidden
              name="actionType"
              value={ApplicationStatus.APPROVED}
            />
            <input hidden name="applicationId" value={application?.id} />
            <input hidden name="menteeFirstName" value={mentee?.firstName} />
            <input hidden name="menteeLastName" value={mentee?.lastName} />
            <input hidden name="menteeEmail" value={mentee?.email} />
            <Button
              backgroundColor={"brand.500"}
              _hover={{ bg: "brand.200" }}
              style={{ color: "white" }}
              float="right"
              type="submit"
            >
              Approve{" "}
              <FontAwesomeIcon icon={faCheck} style={{ marginLeft: "0.5em" }} />
            </Button>
          </Form>
        </Stack>
        <Stack
          hidden={
            application?.status !== ApplicationStatus.APPROVED &&
            transition.submission?.formData.get("actionType") !==
              ApplicationStatus.APPROVED
          }
        >
          <Text color={"green.500"}>
            Approved <FontAwesomeIcon icon={faCheck} />
          </Text>
        </Stack>
        <Stack
          hidden={
            application?.status !== ApplicationStatus.DENIED &&
            transition.submission?.formData.get("actionType") !==
              ApplicationStatus.DENIED
          }
        >
          <Text color={"red.500"}>
            Denied <FontAwesomeIcon icon={faXmark} />
          </Text>
        </Stack>
      </Stack>
    </div>
  );
}
