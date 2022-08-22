import {
  Flex,
  useColorModeValue,
  Stack,
  Heading,
  Image,
  Text,
  FormControl,
  FormLabel,
  Button,
  transition,
  Link,
  Box,
  Input,
  Textarea,
  Grid,
  GridItem,
  NumberInput,
  NumberInputField,
  NumberDecrementStepper,
  NumberInputStepper,
  NumberIncrementStepper,
} from "@chakra-ui/react";
import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { routes } from "~/routes";
import { getUserSession, requireUser } from "~/utils/user.session";
import Logo from "../../assets/Logo.svg";

export const loader: LoaderFunction = () => {
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const url = new URL(request.url);
  const isSeekingMentor = Boolean(url.searchParams.get("seeking") === "true");
  const requestText = await request.text();
  const user = await requireUser(request);
  const form = new URLSearchParams(requestText);
  const parsedTags = (form.get("tags") ?? "").split(",");
  const values = {
    tags: parsedTags,
    bio: form.get("mentorBio") ?? "",
    company: form.get("company") ?? "",
    cost: form.get("cost") ?? "",
    occupation: form.get("occupation") ?? "",
    achievements: form.get("achievements") ?? "",
    mentoringGoal: form.get("mentoringGoal") ?? "",
    twitter: form.get("twitter") ?? "",
    website: form.get("website") ?? "",
    linkedIn: form.get("linkedIn") ?? "",
    github: form.get("github") ?? "",
    experience: user.experience,
    img: user.img,
    industry: user.industry,
    name: `${user.firstName} ${user.lastName}`,
    profileId: user.id,
  };
  let error: string | undefined = undefined;
  let data: { status: string } | undefined = undefined;
  const baseUrl = process.env.API_URL;

  const response = await fetch(`${baseUrl}/.netlify/functions/put-mentor`, {
    method: "PUT",
    body: JSON.stringify(values),
  })
    .then((user) => user.json())
    .catch(() => {
      console.error(
        "Failed to create mentor profile, please try again in a few minutes."
      );
    });
  if (response.error) {
    error = response.error;
  } else if (response.mentorProfile) {
    return redirect(isSeekingMentor ? routes.browse : routes.home);
  }
  return json({
    error,
    data,
  });
};

const NewMentorProfile = () => {
  const data = useLoaderData();
  return (
    <Flex
      minH={"100vh"}
      align={"center"}
      justify={"center"}
      bg={useColorModeValue("gray.50", "gray.800")}
    >
      <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
        <Stack align={"center"}>
          <Image src={Logo} />
          <Heading fontSize={"4xl"}>New Mentor Profile</Heading>
          <Text fontSize={"lg"} color={"gray.600"}>
            Let's get to know you so you can start helping mentees crush their
            goals!
          </Text>
        </Stack>
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={"lg"}
          p={8}
        >
          <Form method="post" style={{ padding: 5 }}>
            <Stack spacing={3}>
              <FormControl>
                <FormLabel>Tags</FormLabel>
                <Text fontSize={"xs"} textColor="grey.600">
                  Comma separated list of your skills (tags)
                </Text>
                <Input
                  name="tags"
                  placeholder="Ex. Product Design, Javascript, Real Estate"
                ></Input>
              </FormControl>
              <FormControl>
                <FormLabel>Company</FormLabel>
                <Text fontSize={"xs"} textColor="grey.600">
                  Current workplace or business
                </Text>
                <Input name="company" placeholder="Company"></Input>
              </FormControl>
              <FormControl>
                <FormLabel>Occupation</FormLabel>
                <Text fontSize={"xs"} textColor="grey.600">
                  Current position or title
                </Text>
                <Input name="occupation" placeholder="Occupation"></Input>
              </FormControl>
              <FormControl>
                <FormLabel>Mentor Bio </FormLabel>
                <Text fontSize={"xs"} textColor="grey.600">
                  Tell us a little bit about your background and mention any
                  mentee preferences. (This will be public.)
                </Text>
                <FormLabel></FormLabel>
                <Textarea
                  size="sm"
                  name="mentorBio"
                  placeholder="I work at...💼&#10;I have achieved...🏆&#10;I'm looking for a mentee who...🧑🏽‍🏫"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Cost ($)</FormLabel>
                <Text fontSize={"xs"} textColor="grey.600">
                  Your minimum monthly package cost in US dollars. (You can
                  override this later.)
                </Text>
                <NumberInput min={0} name="cost">
                  <NumberInputField placeholder="Cost" required />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel>Prior Experience</FormLabel>
                <Text fontSize={"xs"} textColor="grey.600">
                  What is your prior experience (if any) with mentoring or
                  career coaching? (This will NOT be public.)
                </Text>
                <FormLabel></FormLabel>
                <Textarea size="sm" name="priorExperience" required />
              </FormControl>
              <FormControl>
                <FormLabel>Achievements</FormLabel>
                <Text fontSize={"xs"} textColor="grey.600">
                  What are your significant achievements, certifications,
                  awards? (This will NOT be public.)
                </Text>
                <FormLabel></FormLabel>
                <Textarea size="sm" name="achievements" required />
              </FormControl>
              <FormControl>
                <FormLabel>Mentoring Goal</FormLabel>
                <Text fontSize={"xs"} textColor="grey.600">
                  What is your goal as a mentor? (This will NOT be public.)
                </Text>
                <FormLabel></FormLabel>
                <Textarea size="sm" name="mentoringGoal" required />
              </FormControl>
              <FormControl>
                <FormLabel>Social Media (Optional)</FormLabel>
                <Grid templateColumns={"repeat(2, 1fr)"} gap={2}>
                  <GridItem>
                    <Input size="sm" name="twitter" placeholder="Twitter" />
                  </GridItem>
                  <GridItem>
                    <Input size="sm" name="website" placeholder="Website" />
                  </GridItem>
                  <GridItem>
                    <Input size="sm" name="linkedIn" placeholder="LinkedIn" />
                  </GridItem>
                  <GridItem>
                    <Input size="sm" name="github" placeholder="Github" />
                  </GridItem>
                </Grid>
              </FormControl>
              <Stack
                spacing={4}
                direction="row"
                align="center"
                justifyContent="end"
                pt="5"
              >
                <Text color={"red.500"}>{data?.error}</Text>
                <Button
                  background="brand.500"
                  textColor="white"
                  isLoading={transition.state === "submitting"}
                  type="submit"
                  _hover={{ backgroundColor: "brand.200" }}
                >
                  Next
                </Button>
              </Stack>
            </Stack>
          </Form>
        </Box>
      </Stack>
    </Flex>
  );
};

export default NewMentorProfile;
