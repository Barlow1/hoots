import {
  FormControl,
  FormLabel,
  Input,
  Box,
  Text,
  Button,
  Select,
  NumberInput,
  NumberInputStepper,
  NumberInputField,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Stack,
  Textarea,
  Link,
  Flex,
  useColorModeValue,
  Checkbox,
  Avatar,
  Heading,
  Image,
} from "@chakra-ui/react";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useTransition,
} from "@remix-run/react";
import { ChangeEvent, useCallback, useState } from "react";
import Logo from "../../assets/Logo.svg";
import { routes } from "../../routes";
import { getUserSession, requireUser } from "~/utils/user.session";
import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/server-runtime";
import { useUser } from "~/utils/useRootData";

export const action: ActionFunction = async ({
  request,
}: {
  request: Request;
}) => {
  const requestText = await request.text();
  const form = new URLSearchParams(requestText);
  const url = new URL(request.url);
  const shouldCreateMentorProfile = Boolean(
    url.searchParams.get("create") === "true"
  );
  const isSeekingMentor = Boolean(
    url.searchParams.get("seeking") === "true"
  );
  const values = {
    industry: form.get("industry") ?? "",
    experience: Number(form.get("experience") ?? ""),
    mentorExperience: Number(form.get("mentorExperience") ?? ""),
    mentorCost: Number(form.get("mentorCost") ?? ""),
  };
  let error: string | undefined = undefined;
  let data: { status: string } | undefined = undefined;
  const baseUrl = process.env.API_URL;
  const user = await requireUser(request);
  console.log("required user", user);
  const response = await fetch(
    `${baseUrl}/.netlify/functions/put-user?id=${user?.id}`,
    {
      method: "PUT",
      body: JSON.stringify(values),
    }
  )
    .then((user) => user.json())
    .catch(() => {
      console.error("Failed to put user, please try again in a few minutes.");
    });
  if (response.error) {
    error = response.error;
  } else if (response.user) {
    const user = response.user;
    const userSession = await getUserSession(request);
    userSession.setUser(user);
    data = { status: "success" };
    if (shouldCreateMentorProfile) {
      return redirect(`${routes.newMentorProfile}?${url.search}`);
    } else {
      return redirect(routes.browse, {
        headers: { "Set-Cookie": await userSession.commit() },
      });
    }
  }

  return json({
    error,
    data,
  });
};

export const loader: LoaderFunction = ({ request }) => {
  const url = new URL(request.url);
  const shouldCreateMentorProfile = Boolean(
    url.searchParams.get("create") === "true"
  );
  const isSeekingMentor = Boolean(url.searchParams.get("seeking") === "true");
  return json({ shouldCreateMentorProfile, isSeekingMentor });
};

const Preferences = () => {
  const IndustryList = [
    "Marketing",
    "Engineering",
    "Product Design",
    "Small Buisness",
  ];
  const user = useUser();
  const data = useActionData();
  const transition = useTransition();
  const [uploadedProfilePhoto, setUploadProfilePhoto] = useState<
    File | undefined
  >();
  const { shouldCreateMentorProfile, isSeekingMentor } = useLoaderData();

  const onProfilePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUploadProfilePhoto(event.target.files?.[0]);
  };
  const profilePhotoUrl = uploadedProfilePhoto
    ? URL.createObjectURL(uploadedProfilePhoto)
    : undefined;
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
          <Heading fontSize={"4xl"}>About Me</Heading>
          <Text fontSize={"lg"} color={"gray.600"}>
            A few things we recommend adding to your profile
          </Text>
        </Stack>
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={"lg"}
          p={8}
        >
          <Form
            method="post"
            style={{ padding: 5 }}
            encType="multipart/form-data"
          >
            <Stack spacing={3}>
              <FormControl>
                <Stack spacing={2} mb="2">
                  <FormLabel>Profile Photo</FormLabel>
                  <Avatar src={profilePhotoUrl} size={"lg"} />
                </Stack>
                <input
                  name="profilePhoto"
                  type="file"
                  accept="image/png, image/gif, image/jpeg"
                  onChange={onProfilePhotoChange}
                ></input>
              </FormControl>
              <FormControl>
                <FormLabel>Industry</FormLabel>
                <Select
                  name="industry"
                  defaultValue={user?.industry ?? undefined}
                  placeholder="Select Industry"
                >
                  {IndustryList.map((industry) => {
                    return <option>{industry}</option>;
                  })}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Experience (Years)</FormLabel>
                <NumberInput
                  min={0}
                  defaultValue={user?.experience ?? undefined}
                  name="experience"
                >
                  <NumberInputField placeholder="Years of Experience" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel>Tell us about yourself</FormLabel>
                <Textarea
                  size="sm"
                  name="bio"
                  defaultValue={user?.bio ?? undefined}
                  placeholder="I work at...💼&#10;I am currently learning...📚&#10;I'm looking for a mentor with skills in...🧑🏽‍🏫"
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
                <Link
                  href={isSeekingMentor ? routes.browse : routes.home}
                  style={{ textDecoration: "none", display: "flex" }}
                  _focus={{ boxShadow: "none" }}
                >
                  <Button
                    background="gray.500"
                    textColor={"white"}
                    _hover={{ backgroundColor: "gray.300" }}
                  >
                    Skip
                  </Button>
                </Link>
              </Stack>
            </Stack>
          </Form>
        </Box>
      </Stack>
    </Flex>
  );
};

export default Preferences;
