import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Link,
  Stack,
  Text,
  Image,
  useColorModeValue,
  Grid,
  GridItem,
  useCheckboxGroup,
} from "@chakra-ui/react";
import {
  faMagnifyingGlass,
  faPersonCirclePlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Form, useActionData, useTransition } from "@remix-run/react";
import {
  ActionFunction,
  LoaderFunction,
  redirect,
} from "@remix-run/server-runtime";
import { userInfo } from "os";
import LargeCheckBox from "~/components/LargeCheckBox";
import { routes } from "~/routes";
import { getUser, requireUser } from "~/utils/user.session";
import Logo from "../../assets/Logo.svg";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  if (user.verified) {
    throw redirect(routes.start);
  }
  return null;
};

export const action: ActionFunction = async ({ request }) => {};

const CheckEmail = () => {
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
        </Stack>
      </Stack>
    </Flex>
  );
};

export default CheckEmail;
