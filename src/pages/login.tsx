import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  Stack,
  Link,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Image,
} from "@chakra-ui/react";
import { Link as NavLink, Navigate } from "@tanstack/react-location";
import { useUser } from "../components/UserContext";
import { routes } from "../routes";
import Logo from "../assets/Logo.svg";
import { Field, FieldAttributes, Form, Formik } from "formik";
import { useCallback, useState } from "react";

export default function Login() {
  const [error, setError] = useState<string | undefined>();
  const [user, setUser] = useUser();
  const onSubmit = useCallback(async (values: any, actions: any) => {
    const baseUrl = import.meta.env.VITE_API_URL;
    const response = await fetch(`${baseUrl}/.netlify/functions/authenticate`, {
      method: "PUT",
      body: JSON.stringify(values),
    })
      .then((user) => user.json())
      .catch(() => {
        alert(
          "Failed to authenticate user, please try again in a few minutes."
        );
      });
    if (response.error) {
      setError(response.error);
    } else if (response.user) {
      setUser(response.user);
    }
  }, []);

  if (user) {
    return <Navigate to={routes.home} />;
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
          <Heading fontSize={"4xl"}>Sign in to your account</Heading>
          <Text fontSize={"lg"} color={"gray.600"}>
            Welcome back - <Link color={"brand.900"}>Hoot</Link> 🦉
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
              email: "",
              password: "",
            }}
            onSubmit={onSubmit}
          >
            <Form>
              <Stack spacing={4}>
                <Field name="email">
                  {({ field }: FieldAttributes<any>) => (
                    <FormControl id="email">
                      <FormLabel>Email address</FormLabel>
                      <Input {...field} type="email" />
                    </FormControl>
                  )}
                </Field>
                <Field name="password">
                  {({ field }: FieldAttributes<any>) => (
                    <FormControl id="password">
                      <FormLabel>Password</FormLabel>
                      <Input {...field} type="password" />
                    </FormControl>
                  )}
                </Field>
                <Stack spacing={10}>
                  <Stack
                    direction={{ base: "column", sm: "row" }}
                    align={"start"}
                    justify={"space-between"}
                  >
                    <Checkbox>Remember me</Checkbox>
                    <Link as={NavLink} to={routes.signup} color={"blue.400"}>
                      Create an account
                    </Link>
                  </Stack>
                  <Text color={"red.500"}>{error}</Text>
                  <Button
                    bg={"brand.500"}
                    color={"white"}
                    _hover={{
                      bg: "brand.900",
                    }}
                    type="submit"
                  >
                    Sign in
                  </Button>
                </Stack>
              </Stack>
            </Form>
          </Formik>
        </Box>
      </Stack>
    </Flex>
  );
}
