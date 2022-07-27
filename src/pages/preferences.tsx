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
import { useNavigate } from "@tanstack/react-location";
import { Field, FieldAttributes, Form, Formik } from "formik";
import { useCallback, useState } from "react";
import Logo from "../assets/Logo.svg";
import { useUser } from "../components/UserContext";
import { routes } from "../routes";

const Preferences = () => {
  const IndustryList = [
    "Marketing",
    "Engineering",
    "Product Design",
    "Small Buisness",
  ];
  const [sliderValue, setSliderValue] = useState<any>(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [user, setUser] = useUser();
  const navigate = useNavigate();
  const onSubmit = useCallback(async (values: any, actions: any) => {
    const baseUrl = import.meta.env.VITE_API_URL;
    const response = await fetch(
      `${baseUrl}/.netlify/functions/put-user?id=${user?.id}`,
      {
        method: "PUT",
        body: JSON.stringify(values),
      }
    )
      .then((user) => user.json())
      .catch(() => {
        alert("Failed to put user, please try again in a few minutes.");
      });
    if (response.error) {
      setError(response.error);
    } else if (response.user) {
      setUser(response.user);
      navigate({ to: routes.recommendations, replace: true });
    }
  }, []);
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
        <Formik
          initialValues={{
            industry: user?.industry ?? "",
            experience: user?.experience ?? "",
            bio: user?.bio ?? "",
            mentorCost: user?.mentorPreferences?.cost ?? "",
            mentorExperience: user?.mentorPreferences?.experience ?? "",
          }}
          onSubmit={onSubmit}
        >
          {(props) => (
            <Form style={{ padding: 5 }}>
              <Stack spacing={3}>
                <Field name="industry">
                  {({ field }: FieldAttributes<any>) => (
                    <FormControl>
                      <FormLabel>Industry</FormLabel>
                      <Select {...field} placeholder="Select Industry">
                        {IndustryList.map((industry) => {
                          return <option>{industry}</option>;
                        })}
                      </Select>
                    </FormControl>
                  )}
                </Field>
                <Field name="experience">
                  {({ field, form }: FieldAttributes<any>) => (
                    <FormControl>
                      <FormLabel>Experience</FormLabel>
                      <NumberInput
                        min={0}
                        {...field}
                        onChange={(val) =>
                          form.setFieldValue(field.name, Number(val))
                        }
                      >
                        <NumberInputField
                          {...field}
                          placeholder="Years of Experience"
                        />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  )}
                </Field>
                <Field name="bio">
                  {({ field }: FieldAttributes<any>) => (
                    <FormControl>
                      <FormLabel>Tell us about yourself!</FormLabel>
                      <Textarea
                        size="sm"
                        {...field}
                        placeholder="I work at...💼&#10;I am currently learning...📚&#10;I'm looking for a mentor with skills in...🧑🏽‍🏫"
                      />
                    </FormControl>
                  )}
                </Field>
                <Field name="mentorExperience">
                  {({ field, form }: FieldAttributes<any>) => (
                    <FormControl>
                      <FormLabel>Desired Mentor Experience</FormLabel>
                      <NumberInput
                        min={0}
                        {...field}
                        onChange={(val) =>
                          form.setFieldValue(field.name, Number(val))
                        }
                      >
                        <NumberInputField
                          {...field}
                          placeholder="Mentors Experience (years)"
                        />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  )}
                </Field>
                <Field name="mentorCost">
                  {({ field, form }: FieldAttributes<any>) => (
                    <FormControl>
                      <FormLabel>Desired Mentor Monthly Cost</FormLabel>
                      <Slider
                        {...field}
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
                          form.setFieldValue(field.name, val);
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
                  )}
                </Field>
                <Stack
                  spacing={4}
                  direction="row"
                  align="center"
                  justifyContent="center"
                >
                  <Text color={"red.500"}>{error}</Text>
                  <Button
                    background="brand.200"
                    textColor="white"
                    isLoading={props.isSubmitting}
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
          )}
        </Formik>
      </Box>
    </Flex>
  );
};

export default Preferences;
