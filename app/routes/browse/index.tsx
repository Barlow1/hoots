import {
  Avatar,
  Box,
  Flex,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  IconButton,
  Input,
  Tag,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { Mentor } from "@prisma/client";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { routes } from "../../routes";
import debounce from "lodash.debounce";
import { json, LoaderFunction } from "@remix-run/node";
import {
  Link,
  useLoaderData,
  useLocation,
  useNavigate,
} from "@remix-run/react";
import { faFilter, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FilterDialog, { FilterValues } from "~/components/FilterDialog";

type Route = {
  data: { mentors: Mentor[] };
};

const buildMentorFetchUrl = (
  baseUrl: string | undefined,
  query: string | null,
  minCost: string | null,
  maxCost: string | null
) => {
  let getMentorsUrl = `${baseUrl}/.netlify/functions/get-mentors`;

  if (query || minCost || maxCost) {
    const params = new URLSearchParams({
      query: query ? query : "",
      min_cost: minCost ? minCost : "",
      max_cost: maxCost ? maxCost : "",
    });
    getMentorsUrl += `?${params}`;
  }
  return getMentorsUrl;
};

export const loader: LoaderFunction = async ({ request }) => {
  const baseUrl = process.env.DEPLOY_PRIME_URL;
  const url = new URL(request.url);
  const query = url.searchParams.get("query");
  const minCost = url.searchParams.get("min_cost");
  const maxCost = url.searchParams.get("max_cost");

  const mentors = await fetch(
    buildMentorFetchUrl(baseUrl, query, minCost, maxCost)
  )
    .then((mentors) => mentors.json())
    .then((mentors) =>
      mentors.map((mentor: any) => {
        if (mentor._id) {
          return { ...mentor, id: mentor._id.$oid };
        } else {
          return mentor;
        }
      })
    )
    .catch(() => {
      console.error(
        "Failed to get mentors, please try again in a few minutes."
      );
    });
  return json({ data: { mentors: mentors as Mentor[] } });
};

const Browse = () => {
  const [query, setQuery] = useState<string>("");
  const { data } = useLoaderData<Route>();

  const location = useLocation();
  const navigate = useNavigate();
  const updateQueryAndNavigate = async () => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("query", query);
    navigate(`${location.pathname}?${searchParams}`);
  };

  const searchParams = new URLSearchParams(location.search);

  const onSearchKeyUp: React.KeyboardEventHandler<HTMLInputElement> = async (
    e
  ) => {
    if (e.key === "Enter") {
      updateQueryAndNavigate();
    }
  };

  const onSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const onFilterSave = (filterValues: FilterValues) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("min_cost", filterValues.min_cost.toString());
    searchParams.set("max_cost", filterValues.max_cost.toString());
    navigate(`${location.pathname}?${searchParams}`);
  };

  return (
    <div>
      <Grid>
        <GridItem boxShadow="md" colSpan={12} w="100%" borderRadius="5">
          <Box padding="5">
            <Flex justifyContent={"space-between"}>
              <Heading as="h1" size="xl">
                Browse
              </Heading>
              <FilterDialog
                onSave={onFilterSave}
                minCost={searchParams.get("min_cost") ?? undefined}
                maxCost={searchParams.get("max_cost") ?? undefined}
              />
            </Flex>
            <Box pt="5">
              <Flex>
                <Input
                  name="search"
                  onChange={onSearchChange}
                  placeholder="Search..."
                  maxW="200"
                  onKeyUp={onSearchKeyUp}
                  mr="2"
                  defaultValue={searchParams.get("query") ?? undefined}
                ></Input>
                <IconButton
                  aria-label="Search"
                  background="brand.500"
                  textColor="white"
                  onClick={updateQueryAndNavigate}
                  _hover={{ backgroundColor: "brand.200" }}
                  icon={<FontAwesomeIcon icon={faMagnifyingGlass} />}
                />
              </Flex>
              <FormLabel
                color="gray.500"
                fontSize={"xs"}
                ml="1"
                htmlFor="search"
              >
                Hint: try searching for "React"
              </FormLabel>
            </Box>
          </Box>
        </GridItem>
      </Grid>

      {data.mentors && (
        <Grid
          templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }}
          gap={5}
          pt="5"
        >
          {data.mentors?.map((mentor) => {
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
      {!data.mentors?.length && (
        <Text>No results found. Please update your search and try again.</Text>
      )}
    </div>
  );
};

export default Browse;
