import { ArrowBackIcon, TimeIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Image,
  Tag,
  Text,
} from "@chakra-ui/react";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Mentor } from "@prisma/client";
import { json, LoaderFunction } from "@remix-run/node";
import {
  Link,
  useLoaderData,
  useLocation,
  useNavigate,
} from "@remix-run/react";

type Route = {
  LoaderData: { mentor: Mentor };
  Params: { id: string };
};

export const loader: LoaderFunction = async ({ params, request }) => {
  const baseUrl = new URL(request.url).origin;
  const mentor = await fetch(
    `${baseUrl}/.netlify/functions/get-mentor?id=${params.id}`
  )
    .then((mentors) => mentors.json())
    .catch(() => {
      console.error("Failed to get mentor, please try again in a few minutes.");
    });

  return json({ data: { mentor: mentor as Mentor } });
};

export const MentorPage = () => {
  const { data } = useLoaderData();
  const mentor = data.mentor;
  return (
    <Box justifyContent={"center"} key={mentor?.id}>
      <Flex w="full" justifyContent={"space-between"} mb="5">
        <Button
          leftIcon={<ArrowBackIcon />}
          onClick={() => {
            window.history.back();
          }}
        >
          Back
        </Button>
      </Flex>
      <Flex justifyContent={"center"} maxW="xl" mx={"auto"}>
        <Flex direction={"column"}>
          <Flex justifyContent={"center"} pb={5}>
            <Avatar size="2xl" src={mentor?.img} />
          </Flex>
          <Heading as="h2" size="lg" noOfLines={1}>
            {mentor?.name}
          </Heading>
          <Text>💼 {mentor?.occupation}</Text>
          <Text>🏢 {mentor?.company}</Text>
          <Text>🕒 {mentor?.experience} years</Text>
          <Text>💲 {mentor?.cost || "FREE"}</Text>
          <Flex py={1} wrap={"wrap"}>
            {mentor?.tags.map((tag: any) => {
              return (
                <Tag
                  key={tag}
                  background="brand.500"
                  color="white"
                  mr={1}
                  mb={1}
                >
                  {tag}
                </Tag>
              );
            })}
          </Flex>
          <Text>{mentor?.bio}</Text>
          <Button
            backgroundColor={"brand.500"}
            _hover={{ bg: "brand.200" }}
            style={{ color: "white" }}
            justifySelf="center"
            as={Link}
            to={"apply"}
            mt={5}
            w="full"
            mx={"auto"}
          >
            Apply{" "}
            <FontAwesomeIcon
              icon={faPaperPlane}
              style={{ marginLeft: "0.5em" }}
            />
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default MentorPage;
