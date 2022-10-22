import {
  Box,
  Button,
  Checkbox,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
  Image,
  useColorModeValue,
} from "@chakra-ui/react";
import { Form, useActionData, useTransition } from "@remix-run/react";
import {
  ActionFunction,
  LoaderFunction,
  redirect,
} from "@remix-run/server-runtime";
import { userInfo } from "os";
import LargeCheckBox from "~/components/LargeCheckBox";
import { routes } from "~/routes";
import { createVerificationLink } from "~/utils/email-verification.server";
import { sendEmail } from "~/utils/email.server";
import { getUser, requireUser } from "~/utils/user.session";
import Logo from "../../assets/Logo.svg";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  if (user.verified) {
    throw redirect(routes.start);
  }
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const baseUrl = new URL(request.url).origin;
  const user = await getUser(request);
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
  return true;
};
const CheckEmail = () => {
  const transition = useTransition();
  const newEmailSent = useActionData();
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
          <Heading fontSize={"4xl"}>Email Verification</Heading>
          <Text fontSize={"lg"} color={"gray.600"}>
            Check your email for a verification link.
          </Text>
          <Form method="post">
            {transition.state === "idle" && !newEmailSent && (
              <>
                <Text fontSize={"sm"} color={"gray.600"}>
                  Don't see it?{" "}
                  <Link as={"button"} type="submit" color="brand.900">
                    Send it again
                  </Link>
                </Text>
              </>
            )}
            {transition.state === "idle" && newEmailSent && (
              <Text fontSize={"sm"} color={"gray.600"}>
                Sent
              </Text>
            )}
            {transition.state !== "idle" && (
              <Text fontSize={"sm"} color={"gray.600"}>
                Sending...
              </Text>
            )}
          </Form>
        </Stack>
      </Stack>
    </Flex>
  );
};

export default CheckEmail;
