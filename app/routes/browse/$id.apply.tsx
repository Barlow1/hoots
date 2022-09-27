import {
  Avatar,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  ListItem,
  Stack,
  Text,
  Textarea,
  UnorderedList,
} from "@chakra-ui/react";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Mentor, Profile } from "@prisma/client";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { sendEmail } from "~/utils/email.server";
import { requireUser } from "~/utils/user.session";

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
    desires: form.get("desires") ?? "",
    goal: form.get("goal") ?? "",
    progress: form.get("progress") ?? "",
    deadline: form.get("deadline") ?? "",
    questions: form.get("questions") ?? "",
  };
  sendEmail({
    fromName: `${user.firstName} ${user.lastName} via Hoots`,
    toName: values.mentorFirstName,
    email: values.mentorEmail,
    subject: "Hoots - New Mentee Application",
    template: "new-mentee-application",
    variables: {
      firstName: values.mentorFirstName,
      menteeFirstName: user.firstName,
      menteeLastName: user.lastName,
    },
  });
  return null;
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
  const mentor = data.mentor;
  const mentorFirstName = mentor.name.split(" ")[0] ?? "your mentor";
  return (
    <div>
      <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
        <Heading>Mentorship Application</Heading>
        <Flex>
          <Avatar src={mentor.img} />
          <Text fontSize={"lg"} color={"gray.600"} alignSelf={"center"} ml={3}>
            {mentor.name}
          </Text>
        </Flex>
        <Box bgColor={"gray.200"} p={5}>
          <Text>Details</Text>
          <UnorderedList>
            <ListItem>
              Your application will be sent to {mentorFirstName} for review.
              Make sure to include as much detail as possible.
            </ListItem>
            <ListItem>
              You will receive an email after your application has been reviewed
              by {mentorFirstName}.
            </ListItem>
            <ListItem>
              Pricing, meeting modality and meeting occurrence will be discussed
              upon approval.
            </ListItem>
          </UnorderedList>
        </Box>
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
          <Stack spacing={3}>
            <FormControl isRequired>
              <FormLabel>Desires</FormLabel>
              <Text fontSize={"xs"} textColor="grey.600">
                Describe the qualities you look for in a mentor and any specific
                help you need.
              </Text>
              <Textarea name="desires" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Goal</FormLabel>
              <Text fontSize={"xs"} textColor="grey.600">
                Describe the goal of your mentorship.
              </Text>
              <Textarea name="goal" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Progress</FormLabel>
              <Text fontSize={"xs"} textColor="grey.600">
                Describe your current situation and actions you've taken to
                reach your goal.
              </Text>
              <Textarea name="progress" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Deadline</FormLabel>
              <Text fontSize={"xs"} textColor="grey.600">
                Do you have a target date for your goal?
              </Text>
              <Input name="deadline" />
            </FormControl>
            <FormControl>
              <FormLabel>Questions</FormLabel>
              <Text fontSize={"xs"} textColor="grey.600">
                Do you have any questions for {mentorFirstName}?
              </Text>
              <Textarea name="questions" />
            </FormControl>
          </Stack>
          <Stack
            spacing={4}
            direction="row"
            align="center"
            justifyContent="end"
            pt="5"
          >
            <Button
              backgroundColor={"brand.500"}
              _hover={{ bg: "brand.200" }}
              style={{ color: "white" }}
              float="right"
              type="submit"
            >
              Apply{" "}
              <FontAwesomeIcon
                icon={faPaperPlane}
                style={{ marginLeft: "0.5em" }}
              />
            </Button>
          </Stack>
        </Form>
      </Stack>
    </div>
  );
}
