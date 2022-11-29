import {
  Flex,
  useColorModeValue,
  Stack,
  Heading,
  Image,
  Text,
  FormControl,
  FormLabel,
  Button,
  Box,
  Input,
  Textarea,
  Grid,
  GridItem,
  NumberInput,
  NumberInputField,
  NumberDecrementStepper,
  NumberInputStepper,
  NumberIncrementStepper,
} from '@chakra-ui/react';
import type {
  ActionFunction,
  LoaderFunction} from '@remix-run/node';
import {
  json,
  redirect,
} from '@remix-run/node';
import { Form, useLoaderData, useTransition } from '@remix-run/react';
import { routes } from '~/routes';
import { requireUser } from '~/utils/user.session.server';
import { useMentorProfile, useUser } from '~/utils/useRootData';
import Logo from '../../assets/Logo.svg';

export const loader: LoaderFunction = async ({ request }) => {
  await requireUser(request);
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const url = new URL(request.url);
  const isSeekingMentor = Boolean(url.searchParams.get('seeking') === 'true');
  const requestText = await request.text();
  const user = await requireUser(request);
  const form = new URLSearchParams(requestText);
  const parsedTags = (form.get('tags') ?? '').split(',');
  const values = {
    tags: parsedTags,
    bio: form.get('mentorBio') ?? '',
    company: form.get('company') ?? '',
    cost: form.get('cost') ?? '',
    occupation: form.get('occupation') ?? '',
    achievements: form.get('achievements') ?? '',
    mentoringGoal: form.get('mentoringGoal') ?? '',
    twitter: form.get('twitter') ?? '',
    website: form.get('website') ?? '',
    linkedIn: form.get('linkedIn') ?? '',
    github: form.get('github') ?? '',
    id: form.get('mentorID') ?? undefined,
    priorExperience: form.get('priorExperience') ?? '',
    experience: user.experience ?? 0,
    img: user.img,
    industry: user.industry ?? '',
    name: `${user.firstName} ${user.lastName}`,
    profileId: user.id,
  };
  let error: string | undefined;
  const data: { status: string } | undefined = undefined;
  const baseUrl = new URL(request.url).origin;

  const response = await fetch(`${baseUrl}/.netlify/functions/put-mentor`, {
    method: 'PUT',
    body: JSON.stringify(values),
  })
    .then((userResp) => userResp.json())
    .catch(() => {
      console.error(
        'Failed to create mentor profile, please try again in a few minutes.',
      );
    });
  if (response.error) {
    error = response.error;
  } else if (response.mentorProfile) {
    return redirect(
      isSeekingMentor
        ? routes.browse
        : `${routes.browse}/${response.mentorProfile.id}`,
    );
  }
  return json({
    error,
    data,
  });
};

function NewMentorProfile() {
  const data = useLoaderData();
  const transition = useTransition();
  const mentorProfile = useMentorProfile();
  const user = useUser();
  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg={useColorModeValue('gray.50', 'gray.800')}
    >
      <Stack spacing={8} mx="auto" maxW="lg" py={12} px={6}>
        <Stack align="center">
          <Image src={Logo} />
          <Heading fontSize="4xl">
            {mentorProfile ? 'Edit Mentor Profile' : 'New Mentor Profile'}
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Let's get to know you so you can start helping mentees crush their
            goals!
          </Text>
        </Stack>
        <Box
          rounded="lg"
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow="lg"
          p={8}
        >
          <Form method="post" style={{ padding: 5 }}>
            {mentorProfile ? (
              <input hidden name="mentorID" value={mentorProfile?.id} />
            ) : null}
            <Stack spacing={3}>
              <FormControl>
                <FormLabel>Tags</FormLabel>
                <Text fontSize="xs" textColor="grey.600">
                  Comma separated list of your skills (tags)
                </Text>
                <Input
                  name="tags"
                  placeholder="Ex. Product Design, Javascript, Real Estate"
                  defaultValue={mentorProfile?.tags}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Company</FormLabel>
                <Text fontSize="xs" textColor="grey.600">
                  Current workplace or business
                </Text>
                <Input
                  name="company"
                  placeholder="Company"
                  defaultValue={mentorProfile?.company}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Occupation</FormLabel>
                <Text fontSize="xs" textColor="grey.600">
                  Current position or title
                </Text>
                <Input
                  name="occupation"
                  placeholder="Occupation"
                  defaultValue={mentorProfile?.occupation}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Mentor Bio </FormLabel>
                <Text fontSize="xs" textColor="grey.600">
                  Tell us a little bit about your background and mention any
                  mentee preferences. (This will be public.)
                </Text>
                <FormLabel />
                <Textarea
                  size="sm"
                  name="mentorBio"
                  placeholder="I work at...💼&#10;I have achieved...🏆&#10;I'm looking for a mentee who...🧑🏽‍🏫"
                  defaultValue={mentorProfile?.bio ?? user?.bio ?? undefined}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Cost ($)</FormLabel>
                <Text fontSize="xs" textColor="grey.600">
                  Your minimum monthly package cost in US dollars. (You can
                  override this later.)
                </Text>
                <NumberInput min={0} name="cost">
                  <NumberInputField
                    placeholder="Cost"
                    required
                    defaultValue={mentorProfile?.cost ?? undefined}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel>Prior Experience</FormLabel>
                <Text fontSize="xs" textColor="grey.600">
                  What is your prior experience (if any) with mentoring or
                  career coaching? (This will NOT be public.)
                </Text>
                <FormLabel />
                <Textarea
                  size="sm"
                  name="priorExperience"
                  required
                  defaultValue={mentorProfile?.priorExperience ?? undefined}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Achievements</FormLabel>
                <Text fontSize="xs" textColor="grey.600">
                  What are your significant achievements, certifications,
                  awards? (This will NOT be public.)
                </Text>
                <FormLabel />
                <Textarea
                  size="sm"
                  name="achievements"
                  required
                  defaultValue={mentorProfile?.achievements ?? undefined}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Mentoring Goal</FormLabel>
                <Text fontSize="xs" textColor="grey.600">
                  What is your goal as a mentor? (This will NOT be public.)
                </Text>
                <FormLabel />
                <Textarea
                  size="sm"
                  name="mentoringGoal"
                  required
                  defaultValue={mentorProfile?.mentoringGoal ?? undefined}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Social Media (Optional)</FormLabel>
                <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                  <GridItem>
                    <Input
                      size="sm"
                      name="twitter"
                      placeholder="Twitter"
                      defaultValue={mentorProfile?.twitter ?? undefined}
                    />
                  </GridItem>
                  <GridItem>
                    <Input
                      size="sm"
                      name="website"
                      placeholder="Website"
                      defaultValue={mentorProfile?.website ?? undefined}
                    />
                  </GridItem>
                  <GridItem>
                    <Input
                      size="sm"
                      name="linkedIn"
                      placeholder="LinkedIn"
                      defaultValue={mentorProfile?.linkedIn ?? undefined}
                    />
                  </GridItem>
                  <GridItem>
                    <Input
                      size="sm"
                      name="github"
                      placeholder="Github"
                      defaultValue={mentorProfile?.github ?? undefined}
                    />
                  </GridItem>
                </Grid>
              </FormControl>
              <Stack
                spacing={4}
                direction="row"
                align="center"
                justifyContent="end"
                pt="5"
              >
                <Text color="red.500">{data?.error}</Text>
                <Button
                  background="brand.500"
                  textColor="white"
                  isLoading={transition.state === 'submitting'}
                  type="submit"
                  _hover={{ backgroundColor: 'brand.200' }}
                >
                  Save
                </Button>
              </Stack>
            </Stack>
          </Form>
        </Box>
      </Stack>
    </Flex>
  );
}

export default NewMentorProfile;
