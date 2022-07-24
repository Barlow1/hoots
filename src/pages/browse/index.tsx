import { Avatar, Box, Flex, Heading, Text } from "@chakra-ui/react";
import { Mentor } from "@prisma/client";
import {
  Link,
  LoaderFn,
  MakeGenerics,
  useMatch,
} from "@tanstack/react-location";
import { routes } from "../../routes";

type Route = MakeGenerics<{
  LoaderData: { mentors: Mentor[] };
  Params: { id: string };
}>;

export const loader: LoaderFn<Route> = async () => {
  const baseUrl = import.meta.env.VITE_API_URL;
  const mentors = await fetch(`${baseUrl}/.netlify/functions/get-mentors`)
    .then((mentors) => mentors.json())
    .catch(() => {
      alert("Failed to get mentors, please try again in a few minutes.");
    });

  return { mentors: mentors as Mentor[] };
};

const Browse = () => {
  const { data } = useMatch<Route>();
  return (
    <div>
      <Heading as="h1" size="xl">
        Browse
      </Heading>
      {data.mentors?.map((mentor) => {
        return (
          <Link to={`${routes.browse}/${mentor.id}`}>
            <Box
              maxW="sm"
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              key={mentor.id}
              p="5"
              _hover={{ backgroundColor: "gray.100"}}
            >
              <Flex justifyContent={"center"}>
                <Avatar size="md" src={mentor.img} />
              </Flex>

              <Heading as="h2" size="lg" noOfLines={1}>
                {mentor.name}
              </Heading>
              <Text>💼 {mentor.occupation}</Text>
              <Text>🏢 {mentor.company}</Text>
              <Text>🕒 {mentor.experience} years</Text>
              <Text>💲 {mentor.cost}</Text>
              <Text noOfLines={3}>{mentor.bio}</Text>
            </Box>
          </Link>
        );
      })}
    </div>
  );
};

export default Browse;
