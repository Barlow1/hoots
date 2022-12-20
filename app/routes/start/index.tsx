import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
  Image,
  useColorModeValue,
  Grid,
  GridItem,
  useCheckboxGroup,
} from '@chakra-ui/react';
import {
  faMagnifyingGlass,
  faPersonCirclePlus,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Form, useActionData, useTransition } from '@remix-run/react';
import type {
  ActionFunction,
  LoaderFunction} from '@remix-run/server-runtime';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  redirect,
} from '@remix-run/server-runtime';
import LargeCheckBox from '~/components/LargeCheckBox';
import { routes } from '~/routes';
import { requireUser } from '~/utils/user.session.server';
import Logo from '../../assets/Logo.svg';

const SEEKING_MENTOR = 'SeekingMentor';
const CREATE_MENTOR_PROFILE = 'CreateMentorProfile';
const USER_START_OPTIONS = 'UserStartOptions';

export const loader: LoaderFunction = async ({ request }) => {
  await requireUser(request);
  return null;
};

// eslint-disable-next-line consistent-return
export const action: ActionFunction = async ({ request }) => {
  const requestText = await request.text();
  const form = new URLSearchParams(requestText);
  const userStartOptions: string[] = JSON.parse(
    form.get(USER_START_OPTIONS) ?? '[]',
  );
  const isUserSeekingMentor = userStartOptions.includes(SEEKING_MENTOR);
  const isUserCreatingMentorProfile = userStartOptions.includes(
    CREATE_MENTOR_PROFILE,
  );
  if (isUserSeekingMentor && isUserCreatingMentorProfile) {
    return redirect(`${routes.startAbout}?create=true&seeking=true`);
  } if (isUserSeekingMentor) {
    return redirect(`${routes.startAbout}?create=false&seeking=true`);
  } if (isUserCreatingMentorProfile) {
    return redirect(`${routes.startAbout}?create=true&seeking=false`);
  }
};

function Start() {
  const data = useActionData();
  const transition = useTransition();

  const { value, getCheckboxProps } = useCheckboxGroup({
    defaultValue: [],
  });

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
          <Heading fontSize="4xl">How can we help?</Heading>
          <Text fontSize="lg" color="gray.600">
            – Select one or more options to get started –
          </Text>
        </Stack>
        <Box
          rounded="lg"
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow="lg"
          p={8}
        >
          <Form method="post">
            <Text fontSize="lg" color="gray.600">
              I want to...
            </Text>
            <input
              value={JSON.stringify(value)}
              hidden
              name={USER_START_OPTIONS}
            />
            <Grid
              templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
              gap={5}
              pt="5"
            >
              <GridItem>
                <LargeCheckBox
                  label="Find A Mentor"
                  name={SEEKING_MENTOR}
                  {...getCheckboxProps({ value: SEEKING_MENTOR })}
                  icon={(
                    <FontAwesomeIcon
                      icon={faMagnifyingGlass}
                      size="2x"
                      color="#718096"
                    />
                  )}
                />
              </GridItem>
              <GridItem>
                <LargeCheckBox
                  label="Create a mentor profile"
                  name={CREATE_MENTOR_PROFILE}
                  {...getCheckboxProps({ value: CREATE_MENTOR_PROFILE })}
                  icon={(
                    <FontAwesomeIcon
                      icon={faPersonCirclePlus}
                      size="2x"
                      color="#718096"
                    />
                  )}
                />
              </GridItem>
            </Grid>
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
                disabled={!value.length}
              >
                Next
              </Button>
              <Link
                href={routes.home}
                style={{ textDecoration: 'none', display: 'flex' }}
                _focus={{ boxShadow: 'none' }}
              >
                <Button
                  background="gray.500"
                  textColor="white"
                  _hover={{ backgroundColor: 'gray.300' }}
                >
                  Skip
                </Button>
              </Link>
            </Stack>
          </Form>
        </Box>
      </Stack>
    </Flex>
  );
}

export default Start;
