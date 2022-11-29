import type { LoaderFunction} from '@remix-run/node';
import { redirect } from '@remix-run/node';
import {
  Flex,
  useColorModeValue,
  Stack,
  Heading,
  Image,
  Text,
  Link,
} from '@chakra-ui/react';
import { useLoaderData, Link as NavLink } from '@remix-run/react';
import { getUser, getUserSession } from '~/utils/user.session.server';
import { routes } from '~/routes';
import {
  updateVerifiedProfile,
  verifyToken,
} from '~/utils/email-verification.server';
import Logo from '../../assets/Logo.svg';

type LoaderData = {
  verified: boolean;
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const urlToken = url.searchParams.get('token');
  if (!urlToken) {
    return { verified: false };
  }
  const user = await getUser(request);
  if (!user || !user.email) {
    return redirect(routes.login);
  }
  const verified = verifyToken({ urlToken, email: user.email });
  if (verified) {
    if (!user.verified) {
      // save verified flag
      const verifiedUser = await updateVerifiedProfile({
        verified,
        profileId: user.id,
      });
      const session = await getUserSession(request);
      session.setUser(verifiedUser);
      throw redirect(routes.start, {
        headers: { 'Set-Cookie': await session.commit() },
      });
    }
    throw redirect(routes.start);
  }
  return { verified };
};

export default function VerifyEmail() {
  const { verified } = useLoaderData<LoaderData>();
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
          <Heading fontSize="4xl">Email Verification</Heading>
          {verified ? (
            <Text fontSize="lg" color="gray.600">
              You were successfully verified, you should have been redirected
              {' '}
              <Link as={NavLink} color="blue.400" to={routes.home}>
                here
              </Link>
              {' '}
              though.
            </Text>
          ) : (
            <Text fontSize="lg" color="gray.600">
              We failed to verify your email, try to login
              {' '}
              <Link as={NavLink} color="blue.400" to={routes.login}>
                here
              </Link>
              .
            </Text>
          )}
        </Stack>
      </Stack>
    </Flex>
  );
}
