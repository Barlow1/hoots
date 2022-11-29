/* eslint-disable camelcase */
import {
  FormControl,
  FormLabel,
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
  Avatar,
  Heading,
  Image,
} from "@chakra-ui/react";
import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import type { ChangeEvent } from "react";
import { useState } from "react";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
// eslint-disable-next-line import/no-extraneous-dependencies
import { json, redirect } from "@remix-run/server-runtime";
import {
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import { getUserSession, requireUser } from "~/utils/user.session.server";
import { useUser } from "~/utils/useRootData";
import { uploadImageToCloudinary } from "~/utils/images.server";
import { routes } from "../../routes";
import Logo from "../../assets/Logo.svg";

export const action: ActionFunction = async ({
  request,
}: {
  request: Request;
  // eslint-disable-next-line consistent-return
}) => {
  const user = await requireUser(request);
  const uploadHandler = unstable_composeUploadHandlers(
    // our custom upload handler
    async ({ name, contentType, data, filename }) => {
      if (name !== "profilePhoto") {
        return undefined;
      }
      if (filename) {
        const uploadedImage = await uploadImageToCloudinary(
          data,
          `profile/${user.id}`
        );
        console.log("img_url", uploadedImage.secure_url);
        return uploadedImage.secure_url;
      }
      return undefined;
    },
    // fallback to memory for everything else
    unstable_createMemoryUploadHandler()
  );
  try {
    const form = await unstable_parseMultipartFormData(request, uploadHandler);

    const url = new URL(request.url);
    const shouldCreateMentorProfile = Boolean(
      url.searchParams.get("create") === "true"
    );
    console.log("img_url", form.get("profilePhoto"));
    const values = {
      industry: form.get("industry") ?? "",
      experience: Number(form.get("experience") ?? ""),
      mentorExperience: Number(form.get("mentorExperience") ?? ""),
      mentorCost: Number(form.get("mentorCost") ?? ""),
      bio: form.get("bio") ?? "",
      img:
        typeof form.get("profilePhoto") === "string"
          ? form.get("profilePhoto")
          : undefined,
    };
    let error: string | undefined;
    let data: { status: string } | undefined;
    const baseUrl = new URL(request.url).origin;
    console.log("required user", user);
    const response = await fetch(
      `${baseUrl}/.netlify/functions/put-user?id=${user?.id}`,
      {
        method: "PUT",
        body: JSON.stringify(values),
      }
    ).then((resp) => resp.json());
    if (response.error) {
      error = response.error;
    } else if (response.user) {
      const { user: userResp } = response;
      const userSession = await getUserSession(request);
      userSession.setUser(userResp);
      data = { status: "success" };
      if (shouldCreateMentorProfile) {
        return redirect(`${routes.newMentorProfile}${url.search}`, {
          headers: { "Set-Cookie": await userSession.commit() },
        });
      }
      return redirect(routes.browse, {
        headers: { "Set-Cookie": await userSession.commit() },
      });
    }

    return json({
      error,
      data,
    });
  } catch {
    console.error("Failed to put user, please try again in a few minutes.");
  }
};

export const loader: LoaderFunction = async ({ request }) => {
  await requireUser(request);
  const url = new URL(request.url);
  const shouldCreateMentorProfile = Boolean(
    url.searchParams.get("create") === "true"
  );
  const isSeekingMentor = Boolean(url.searchParams.get("seeking") === "true");
  return json({ shouldCreateMentorProfile, isSeekingMentor });
};

function Preferences() {
  const IndustryList = [
    "Marketing",
    "Engineering",
    "Product Design",
    "Small Business",
  ];
  const user = useUser();
  const data = useActionData();
  const transition = useTransition();
  const [uploadedProfilePhoto, setUploadProfilePhoto] = useState<
    File | undefined
  >();
  const { isSeekingMentor } = useLoaderData();

  const onProfilePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUploadProfilePhoto(event.target.files?.[0]);
  };
  const profilePhotoUrl = uploadedProfilePhoto
    ? URL.createObjectURL(uploadedProfilePhoto)
    : user?.img ?? undefined;
  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg={useColorModeValue("gray.50", "gray.800")}
    >
      <Stack spacing={8} mx="auto" maxW="lg" py={12} px={6}>
        <Stack align="center">
          <Image src={Logo} />
          <Heading fontSize="4xl">About Me</Heading>
          <Text fontSize="lg" color="gray.600">
            A few things we recommend adding to your profile
          </Text>
        </Stack>
        <Box
          rounded="lg"
          bg={useColorModeValue("white", "gray.700")}
          boxShadow="lg"
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
                  <Avatar src={profilePhotoUrl} size="lg" />
                </Stack>
                <input
                  name="profilePhoto"
                  type="file"
                  accept="image/png, image/gif, image/jpeg"
                  onChange={onProfilePhotoChange}
                  style={{ maxWidth: "70vw" }}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Industry</FormLabel>
                <Select
                  name="industry"
                  defaultValue={user?.industry ?? undefined}
                  placeholder="Select Industry"
                  required
                >
                  {IndustryList.map((industry) => (
                    <option>{industry}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Experience (Years)</FormLabel>
                <NumberInput
                  min={0}
                  defaultValue={user?.experience ?? undefined}
                  name="experience"
                >
                  <NumberInputField
                    placeholder="Years of Experience"
                    required
                  />
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
                  required
                />
              </FormControl>
              <Stack
                spacing={4}
                direction="row"
                align="center"
                justifyContent="end"
                pt="5"
              >
                <Text color="red.500">{data?.error}</Text>
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
                    textColor="white"
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
}

export default Preferences;
