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
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Tooltip,
  Link,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  Form,
  useLoaderData,
  useNavigate,
  useTransition,
} from "@remix-run/react";
import { useCallback, useState } from "react";
import Logo from "../assets/Logo.svg";
import { routes } from "../routes";
import { getUserSession, requireUser } from "~/utils/user.session";
import { ActionFunction, json, redirect } from "@remix-run/server-runtime";

export const action: ActionFunction = async ({
  request,
}: {
  request: Request;
}) => {
  const requestText = await request.text();
  const form = new URLSearchParams(requestText);
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
    console.log("found user", response.user);
    const user = response.user;
    const userSession = await getUserSession(request);
    userSession.setUser(user);
    data = { status: "success" };
    return redirect(routes.recommendations, {
      headers: { "Set-Cookie": await userSession.commit() },
    });
  }

  return json({
    error,
    data,
  });
};

const Preferences = () => {
  const IndustryList = [
    "Marketing",
    "Engineering",
    "Product Design",
    "Small Buisness",
  ];
  const [sliderValue, setSliderValue] = useState<any>(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const data = useLoaderData();
  const transition = useTransition();
  return (
    <Flex
      minH={"100vh"}
      align={"center"}
      justify={"center"}
      bg={useColorModeValue("gray.50", "gray.800")}
    >
      <Box
        margin="auto"
        width="50%"
        boxShadow="2xl"
        padding="3"
        maxW="sm"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
      >
        <Text style={{ fontWeight: "bold" }}>About Me</Text>
        <Form method="post" style={{ padding: 5 }}>
          <Stack spacing={3}>
            <FormControl>
              <FormLabel>Industry</FormLabel>
              <Select name="industry" placeholder="Select Industry">
                {IndustryList.map((industry) => {
                  return <option>{industry}</option>;
                })}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Experience</FormLabel>
              <NumberInput min={0} name="experience">
                <NumberInputField placeholder="Years of Experience" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>Tell us about yourself!</FormLabel>
              <Textarea
                size="sm"
                name="bio"
                placeholder="I work at...💼&#10;I am currently learning...📚&#10;I'm looking for a mentor with skills in...🧑🏽‍🏫"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Desired Mentor Experience</FormLabel>
              <NumberInput min={0} name="mentorExperience">
                <NumberInputField placeholder="Mentors Experience (years)" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>Desired Mentor Monthly Cost</FormLabel>
              <Slider
                name="mentorCost"
                aria-label="slider-ex-2"
                onChange={(val) => {
                  if (val <= 10) {
                    setSliderValue("Free");
                  } else if (val > 10 && val <= 30) {
                    setSliderValue("💰");
                  } else if (val > 30 && val <= 50) {
                    setSliderValue("💰💰");
                  } else if (val > 50 && val <= 70) {
                    setSliderValue("💰💰💰");
                  } else if (val > 70 && val <= 90) {
                    setSliderValue("💰💰💰💰");
                  } else {
                    setSliderValue("💰💰💰💰💰");
                  }
                }}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <SliderTrack bg="brand.200">
                  <SliderFilledTrack bg="brand.900" />
                </SliderTrack>
                <Tooltip
                  hasArrow
                  bg="brand.200"
                  color="white"
                  placement="top"
                  isOpen={showTooltip}
                  label={sliderValue}
                >
                  <SliderThumb boxSize={6}>
                    <img src={Logo} alt="Hoots Logo" />
                  </SliderThumb>
                </Tooltip>
              </Slider>
            </FormControl>
            <Stack
              spacing={4}
              direction="row"
              align="center"
              justifyContent="center"
            >
              <Text color={"red.500"}>{data?.error}</Text>
              <Button
                background="brand.200"
                textColor="white"
                isLoading={transition.state === "submitting"}
                type="submit"
              >
                Submit
              </Button>
              <Link
                href={routes.home}
                style={{ textDecoration: "none", display: "flex" }}
                _focus={{ boxShadow: "none" }}
              >
                <Button background="brand.200" textColor="white">
                  Skip
                </Button>
              </Link>
            </Stack>
          </Stack>
        </Form>
      </Box>
    </Flex>
  );
};

export default Preferences;
