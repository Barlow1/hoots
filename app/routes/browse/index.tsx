import {
  Avatar,
  Box,
  Flex,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  Input,
  Tag,
  Text,
} from "@chakra-ui/react";
import { Mentor } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";
import { routes } from "../../routes";
import debounce from "lodash.debounce";
import { json, LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

type Route = {
  LoaderData: { mentors: Mentor[] };
  Params: { id: string };
};

export const loader: LoaderFunction = async () => {
  const baseUrl = process.env.API_URL;
  const mentors = await fetch(`${baseUrl}/.netlify/functions/get-mentors`)
    .then((mentors) => mentors.json())
    .catch(() => {
      alert("Failed to get mentors, please try again in a few minutes.");
    });

  return json({ data: { mentors: mentors as Mentor[] } });
};

const Browse = () => {
  const { data } = useLoaderData();
  const loadedMentors = useMemo(() => data.mentors, []);
  const [mentors, setMentors] = useState<Mentor[] | undefined>(data.mentors);
  const onChange = async (e: any) => {
    const value = e.target.value;
    const baseUrl = window.env.API_URL;
    if (value) {
      const searchResults = await fetch(
        `${baseUrl}/.netlify/functions/search?query=${value}`
      )
        .then((results) => results.json())
        .then((results) => {
          return results.map((response: any) => {
            return { ...response, id: response._id.$oid };
          });
        })
        .catch(() => {
          alert("Failed to update mentors, please try again in a few minutes.");
        });
      setMentors(searchResults);
    } else if (loadedMentors) {
      setMentors(loadedMentors);
    }
  };

  const debouncedChangeHandler = useMemo(() => debounce(onChange, 300), []);
  useEffect(() => {
    return () => {
      debouncedChangeHandler.cancel();
    };
  }, []);
  return (
    <div>
      <Heading as="h1" size="xl">
        Browse
      </Heading>
      <Box pt="5">
        <Input
          name="search"
          onChange={debouncedChangeHandler}
          placeholder="Search..."
          maxW="200"
        ></Input>
        <FormLabel color="gray.500" fontSize={"xs"} ml="1" htmlFor="search">
          Hint: try searching for "React"
        </FormLabel>
      </Box>

      {mentors && (
        <Grid
          templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }}
          gap={5}
          pt="5"
        >
          {mentors?.map((mentor) => {
            return (
              <GridItem key={mentor.id}>
                <Link to={`${routes.browse}/${mentor.id}`}>
                  <Box
                    maxW={{ base: "full", md: "md" }}
                    borderWidth="1px"
                    borderRadius="lg"
                    overflow="hidden"
                    key={mentor.id}
                    p="5"
                    h="100%"
                    _hover={{ backgroundColor: "gray.100" }}
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
                    <Text>💲 {mentor.cost || "FREE"}</Text>
                    <HStack spacing={2}>
                      {mentor.tags.map((tag) => {
                        return (
                          <Tag key={tag} background="brand.500" color="white">
                            {tag}
                          </Tag>
                        );
                      })}
                    </HStack>
                    <Text noOfLines={3}>{mentor.bio}</Text>
                  </Box>
                </Link>
              </GridItem>
            );
          })}
        </Grid>
      )}
      {!mentors?.length && (
        <Text>No results found. Please update your search and try again.</Text>
      )}
    </div>
  );
};

export default Browse;
