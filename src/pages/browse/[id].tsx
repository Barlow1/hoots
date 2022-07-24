import { Avatar, Box, Flex, Heading, Image, Text } from "@chakra-ui/react";
import { Mentor } from "@prisma/client";
import { LoaderFn, MakeGenerics, useMatch } from "@tanstack/react-location";

type Route = MakeGenerics<{
  LoaderData: { mentor: Mentor };
  Params: { id: string };
}>;

export const loader: LoaderFn<Route> = async ({ params }) => {
  const baseUrl = import.meta.env.VITE_API_URL;
  const mentor = await fetch(
    `${baseUrl}/.netlify/functions/get-mentor?id=${params.id}`
  )
    .then((mentors) => mentors.json())
    .catch(() => {
      alert("Failed to get mentor, please try again in a few minutes.");
    });

  return { mentor: mentor as Mentor };
};

export const MentorPage = () => {
  const { data } = useMatch<Route>();
  const mentor = data.mentor;
  console.log(data);
  return (
    <Flex justifyContent={"center"} key={mentor?.id}>
      <Flex direction={"column"}>
        <Flex justifyContent={"center"}>
          <Avatar size="3xl" src={mentor?.img} />
        </Flex>
        <Heading as="h2" size="lg" noOfLines={1}>
          {mentor?.name}
        </Heading>
        <Text>💼 {mentor?.occupation}</Text>
        <Text>🏢 {mentor?.company}</Text>
        <Text>🕒 {mentor?.experience} years</Text>
        <Text>💲 {mentor?.cost}</Text>
        <Text>{mentor?.bio}</Text>
      </Flex>
    </Flex>
  );
};

export default MentorPage;
