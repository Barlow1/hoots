import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { getUser, getUserSession } from "~/utils/user.session.server";
import { routes } from "~/routes";
import {
  updateVerifiedProfile,
  verifyToken,
} from "~/utils/email-verification.server";
import { H1, Paragraph } from "~/components/Typography";
import Logo from "../../assets/Logo.svg";

type LoaderData = {
  verified: boolean;
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const urlToken = url.searchParams.get("token");
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
        headers: { "Set-Cookie": await session.commit() },
      });
    }
    throw redirect(routes.start);
  }
  return { verified };
};

export default function VerifyEmail() {
  const { verified } = useLoaderData<LoaderData>();
  return (
    <>
      <div className="min-h-screen content-center items-center flex">
        <div className="space-y-8 mx-auto max-w-lg py-12 px-6">
          <div className="flex items-center flex-col space-y-8 ">
            <img className="mx-auto h-12 w-auto" src={Logo} alt="Hoots" />
            <H1>Email Verification</H1>
            {verified ? (
              <Paragraph>
                {" "}
                You were successfully verified, you should have been redirected{" "}
                <Link
                  className="hover:underline text-brand-500"
                  to={routes.home}
                >
                  here
                </Link>{" "}
                though.
              </Paragraph>
            ) : (
              <Paragraph>
                {" "}
                We failed to verify your email, try to login{" "}
                <Link
                  className="hover:underline text-brand-500"
                  to={routes.login}
                >
                  here
                </Link>
                .
              </Paragraph>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
