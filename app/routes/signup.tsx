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
import {
  Form,
  Link as NavLink,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { routes } from "../routes";
import { useUser } from "~/utils/useRootData";
import Logo from "../assets/Logo.svg";
import { getUserSession } from "~/utils/user.session";
import { ActionFunction, json, MetaFunction, redirect } from "@remix-run/node";
import { createVerificationLink } from "~/utils/email-verification.server";
import { sendEmail } from "~/utils/email.server";
import { Profile } from "@prisma/client";
import { getSocialMetas } from "~/utils/seo";
import { getDisplayUrl } from "~/utils/url";

export const meta: MetaFunction = ({ data, parentsData }) => {
  const { requestInfo } = parentsData.root;
  return getSocialMetas({
    url: getDisplayUrl(requestInfo),
    title: "Sign Up",
  });
};

export const action: ActionFunction = async ({
  request,
}: {
  request: Request;
}) => {
  const requestText = await request.text();
  const form = new URLSearchParams(requestText);
  const values = {
    firstName: form.get("firstName") ?? "",
    lastName: form.get("lastName") ?? "",
    email: form.get("email") ?? "",
    password: form.get("password") ?? "",
  };
  let error: string | undefined = undefined;
  let data: { status: string } | undefined = undefined;
  const baseUrl = new URL(request.url).origin;

  const response = await fetch(`${baseUrl}/.netlify/functions/put-user`, {
    method: "PUT",
    body: JSON.stringify(values),
  })
    .then((user) => user.json())
    .catch(() => {
      console.error("Failed to put user, please try again in a few minutes.");
    });
  if (response.error) {
    error = response.error;
  } else if (response.user) {
    const user: Profile = response.user;
    const verificationLink = createVerificationLink({
      email: user.email,
      domainUrl: baseUrl,
    });
    await sendEmail({
      toName: `${user.firstName} ${user.lastName}`,
      fromName: "Hoots",
      email: user.email,
      subject: "Email Verification",
      variables: {
        firstName: user.firstName,
        verificationLink,
      },
      template: "email-verification",
    });
    const userSession = await getUserSession(request);
    userSession.setUser(user);
    data = { status: "success" };
    return redirect(routes.startCheckEmail, {
      headers: { "Set-Cookie": await userSession.commit() },
    });
  }

  return json({
    error,
    data,
  });
};

export default function SignupCard() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
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
          <Form method="post">
            <Stack spacing={4}>
              <HStack>
                <Box>
                  <FormControl isRequired>
                    <FormLabel>First Name</FormLabel>
                    <Input name="firstName" type="text" />
                  </FormControl>
                </Box>
                <Box>
                  <FormControl id="lastName">
                    <FormLabel>Last Name</FormLabel>
                    <Input name="lastName" type="text" />
                  </FormControl>
                </Box>
              </HStack>

              <FormControl id="email" isRequired>
                <FormLabel>Email address</FormLabel>
                <Input name="email" type="email" />
              </FormControl>
              <FormControl id="password" isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    name="password"
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
              <Stack spacing={10} pt={2}>
                <Text color={"red.500"}>{data?.error}</Text>
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
        </Box>
      </Stack>
    </Flex>
  );
}
