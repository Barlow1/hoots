import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  HStack,
  InputRightElement,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Link,
  Image,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { Link as NavLink, Navigate } from "@tanstack/react-location";
import { routes } from "../routes";
import { ErrorMessage, Field, FieldAttributes, Form, Formik } from "formik";
import { useUser } from "../components/UserContext";
import Logo from "../assets/Logo.svg";

export default function SignupCard() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [user, setUser] = useUser();
  const onSubmit = useCallback(async (values: any, actions: any) => {
    const baseUrl = import.meta.env.VITE_API_URL;
    const response = await fetch(`${baseUrl}/.netlify/functions/put-user`, {
      method: "PUT",
      body: JSON.stringify(values),
    })
      .then((user) => user.json())
      .catch(() => {
        alert("Failed to put user, please try again in a few minutes.");
      });
    if (response.error) {
      setError(response.error);
    } else if (response.user) {
      setUser(response.user);
    }
  }, []);

  if (user) {
    return <Navigate to={routes.preferences} />;
  }

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
          <Heading fontSize={"4xl"} textAlign={"center"}>
            Sign up
          </Heading>
          <Text fontSize={"lg"} color={"gray.600"}>
            Find a mentor who gives a <Link color={"brand.900"}>Hoot</Link> 🦉
          </Text>
        </Stack>
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={"lg"}
          p={8}
        >
          <Formik
            initialValues={{
              firstName: "",
              lastName: "",
              email: "",
              password: "",
            }}
            onSubmit={onSubmit}
          >
            <Form>
              <Stack spacing={4}>
                <HStack>
                  <Box>
                    <Field name="firstName">
                      {({ field }: FieldAttributes<any>) => (
                        <FormControl isRequired>
                          <FormLabel>First Name</FormLabel>
                          <Input {...field} type="text" />
                        </FormControl>
                      )}
                    </Field>
                  </Box>
                  <Box>
                    <Field name="lastName">
                      {({ field }: FieldAttributes<any>) => (
                        <FormControl id="lastName">
                          <FormLabel>Last Name</FormLabel>
                          <Input {...field} type="text" />
                        </FormControl>
                      )}
                    </Field>
                  </Box>
                </HStack>
                <Field name="email">
                  {({ field }: FieldAttributes<any>) => (
                    <FormControl id="email" isRequired>
                      <FormLabel>Email address</FormLabel>
                      <Input {...field} type="email" />
                    </FormControl>
                  )}
                </Field>
                <Field name="password">
                  {({ field }: FieldAttributes<any>) => (
                    <FormControl id="password" isRequired>
                      <FormLabel>Password</FormLabel>
                      <InputGroup>
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                        />
                        <InputRightElement h={"full"}>
                          <Button
                            variant={"ghost"}
                            onClick={() =>
                              setShowPassword((showPassword) => !showPassword)
                            }
                          >
                            {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                          </Button>
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>
                  )}
                </Field>
                <Stack spacing={10} pt={2}>
                  <Text color={"red.500"}>{error}</Text>
                  <Button
                    loadingText="Submitting"
                    size="lg"
                    bg={"brand.500"}
                    color={"white"}
                    _hover={{
                      bg: "brand.900",
                    }}
                    type="submit"
                  >
                    Sign up
                  </Button>
                </Stack>
                <Stack pt={6}>
                  <Text align={"center"}>
                    Already a user?{" "}
                    <Link as={NavLink} to={routes.login} color={"blue.400"}>
                      Login
                    </Link>
                  </Text>
                </Stack>
              </Stack>
            </Form>
          </Formik>
        </Box>
      </Stack>
    </Flex>
  );
}
