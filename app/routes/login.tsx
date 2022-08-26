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
import {
  Form,
  Link as NavLink,
  useActionData,
  useNavigate,
} from "@remix-run/react";
import { useUser } from "~/utils/useRootData";
import { routes } from "../routes";
import Logo from "../assets/Logo.svg";
import { ActionFunction, json, redirect } from "@remix-run/node";
import { getUserSession } from "~/utils/user.session";

export const action: ActionFunction = async ({
  request,
}: {
  request: Request;
}) => {
  const requestText = await request.text();
  const form = new URLSearchParams(requestText);
  const values = {
    email: form.get("email") ?? "",
    password: form.get("password") ?? "",
  };
  let error: string | undefined = undefined;
  let data: { status: string } | undefined = undefined;
  const baseUrl = process.env.API_URL;
  const response = await fetch(`${baseUrl}/.netlify/functions/authenticate`, {
    method: "PUT",
    body: JSON.stringify(values),
  })
    .then((user) => user.json())
    .catch(() => {
      console.error(
        "Failed to authenticate user, please try again in a few minutes."
      );
    });
  if (response.error) {
    error = response.error;
  } else if (response.user) {
    console.log("found user", response.user);
    const user = response.user;
    const userSession = await getUserSession(request);
    userSession.setUser(user);
    data = { status: "success" };
    return redirect(routes.home, {
      headers: { "Set-Cookie": await userSession.commit() },
    });
  }

  return json({
    error,
    data,
  });
};

export default function Login() {
  const submission = useActionData();
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
          <Form method="post">
            <Stack spacing={4}>
              <FormLabel>Email address</FormLabel>
              <Input name="email" type="email" />

              <FormLabel>Password</FormLabel>
              <Input name="password" type="password" />
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
                <Text color={"red.500"}>{submission?.error}</Text>
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
        </Box>
      </Stack>
    </Flex>
  );
}
