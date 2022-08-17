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
} from "@chakra-ui/react";
import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { routes } from "~/routes";
import Logo from "../../assets/Logo.svg";

export const loader: LoaderFunction = () => {
  return null;
};

export const action: ActionFunction = ({ request }) => {
  const url = new URL(request.url);
  const isSeekingMentor = Boolean(url.searchParams.get("seeking") === "true");
  return redirect(isSeekingMentor ? routes.browse : routes.home);
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
                <FormLabel>Mentor Bio </FormLabel>
                <Text fontSize={"xs"} textColor="grey.600">
                  Tell us a little bit about your background and mention any
                  mentee preferences. (This will be public.){" "}
                </Text>
                <FormLabel></FormLabel>
                <Textarea
                  size="sm"
                  name="bio"
                  placeholder="I work at...💼&#10;I have achieved...🏆&#10;I'm looking for a mentee who...🧑🏽‍🏫"
                />
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
