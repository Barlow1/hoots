import {
  Avatar,
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Tag,
  Text,
} from '@chakra-ui/react';
import type { Mentor } from '@prisma/client';
import { useMemo } from 'react';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { useUser } from '~/utils/useRootData';
import { requireUser } from '~/utils/user.session.server';
import { routes } from '../routes';

type Route = {
  data: { mentors: Mentor[] };
  params: { id: string };
};

export const loader: LoaderFunction = async ({ request }) => {
  await requireUser(request);
  const baseUrl = new URL(request.url).origin;
  const mentors = await fetch(`${baseUrl}/.netlify/functions/get-mentors`)
    .then((response) => response.json())
    .catch(() => {
      console.error(
        'Failed to get mentors, please try again in a few minutes.',
      );
    });

  return json({ data: { mentors: mentors as Mentor[] } });
};

function Recommendations() {
  const { data } = useLoaderData<Route>();
  const user = useUser();
  const desiredCost = user?.mentorPreferences?.cost ?? 0;
  const desiredCostHigh = desiredCost + 20;
  const desiredCostLow = desiredCost - 20;
  const desiredExperienceHigh = (user?.mentorPreferences?.experience ?? 0) + 5;
  const desiredExperienceLow = (user?.mentorPreferences?.experience ?? 0) - 5;

  const mentors = useMemo<Mentor[] | undefined>(() => {
    const topMatches = data.mentors?.filter((option) => {
      let costMatch = false;
      let industryMatch = false;
      let experienceMatch = false;
      const optionCost = option.cost ?? 0;

      if (
        (optionCost <= desiredCostHigh && optionCost >= desiredCostLow)
        || (desiredCost >= 100 && optionCost >= 100)
      ) {
        costMatch = true;
      }
      if (
        desiredExperienceLow <= option.experience
        && option.experience <= desiredExperienceHigh
      ) {
        experienceMatch = true;
      }
      if (option.industry === user?.industry) {
        industryMatch = true;
      }
      return costMatch && industryMatch && experienceMatch;
    });
    return topMatches;
  }, []);
  return (
    <div>
      <Heading as="h1" size="xl">
        Top Matches
      </Heading>

      {mentors && (
        <Grid
          templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' }}
          gap={5}
          pt="5"
        >
          {mentors?.map((mentor) => (
            <GridItem key={mentor.id}>
              <Link to={`${routes.browse}/${mentor.id}`}>
                <Box
                  maxW={{ base: 'full', md: 'md' }}
                  borderWidth="1px"
                  borderRadius="lg"
                  overflow="hidden"
                  key={mentor.id}
                  p="5"
                  h="100%"
                  _hover={{ backgroundColor: 'gray.100' }}
                >
                  <Flex justifyContent="center">
                    <Avatar size="md" src={mentor.img ?? undefined} />
                  </Flex>

                  <Heading as="h2" size="lg" noOfLines={1}>
                    {mentor.name}
                  </Heading>
                  <Text>⭐️ Top Match</Text>
                  <Text>
                    💼
                    {mentor.occupation}
                  </Text>
                  <Text>
                    🏢
                    {mentor.company}
                  </Text>
                  <Text>
                    🕒
                    {mentor.experience}
                    {' '}
                    years
                  </Text>
                  <Text>
                    💲
                    {mentor.cost || 'FREE'}
                  </Text>
                  <HStack spacing={2}>
                    {mentor.tags.map((tag) => (
                      <Tag key={tag} background="brand.500" color="white">
                        {tag}
                      </Tag>
                    ))}
                  </HStack>
                  <Text noOfLines={3}>{mentor.bio}</Text>
                </Box>
              </Link>
            </GridItem>
          ))}
        </Grid>
      )}
      {!mentors?.length && (
        <Text>
          No results found. Please update your preferences and try again.
        </Text>
      )}
    </div>
  );
}

export default Recommendations;
