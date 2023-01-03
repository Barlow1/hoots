import { Form, useLoaderData, useTransition } from "@remix-run/react";
import Button from "~/components/Buttons/IconButton";
import { H2, Paragraph } from "~/components/Typography";
import StripeHelper from "~/utils/stripe.server";
import type { ActionFunction, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { routes } from "~/routes";
import {
  getUserSession,
  requireMentorProfile,
  requireUser,
} from "~/utils/user.session.server";
import { PrismaClient } from "@prisma/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faXmarkCircle,
} from "@fortawesome/free-solid-svg-icons";

const updateStripeId = async ({
  mentorId,
  stripeId,
}: {
  mentorId: string;
  stripeId: string;
}) => {
  const prisma = new PrismaClient();
  await prisma.$connect();
  try {
    let mentorProfile;
    if (mentorId) {
      mentorProfile = await prisma.mentor.update({
        data: {
          stripeId,
        },
        where: {
          id: mentorId,
        },
      });
    }
    return mentorProfile;
  } catch (error) {
    if (error instanceof Error)
      console.error("Failed to update stripe id for mentor", error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export const action: ActionFunction = async ({ request }) => {
  const baseUrl = new URL(request.url).origin;
  const stripe = new StripeHelper();
  const user = await requireUser(request);
  const mentorProfile = await requireMentorProfile(request);
  const userSession = await getUserSession(request);
  const { account, accountLink } = await stripe.createMentorPaymentProfile({
    user,
    returnURL: `${baseUrl}${routes.mentorProfilePayment}`,
    refreshURL: `${baseUrl}${routes.mentorProfilePayment}`,
  });

  const { url } = accountLink;

  if (mentorProfile?.id) {
    const newMentorProfile = await updateStripeId({
      mentorId: mentorProfile?.id,
      stripeId: account.id,
    });
    if (newMentorProfile) userSession.setMentorProfile(newMentorProfile);
  }

  if (url)
    return redirect(url, {
      headers: { "Set-Cookie": await userSession.commit() },
    });
  return null;
};

export const loader = async ({ request }: LoaderArgs) => {
  let isConnectedToStripe = false;
  const mentorProfile = await requireMentorProfile(request);
  const stripe = new StripeHelper();
  if (mentorProfile.stripeId) {
    isConnectedToStripe = await stripe.checkIsAccountLinked(
      mentorProfile.stripeId
    );
  }

  return json({ isConnectedToStripe });
};

export default function NewMentorProfilePayment() {
  const transition = useTransition();
  const { isConnectedToStripe } = useLoaderData<typeof loader>();

  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <H2 className="mt-6 text-center text-3xl font-bold tracking-tight">
          Payment Info
        </H2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-white">
          Quickly setup your stripe account to get paid
        </p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-zinc-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Form method="post" style={{ padding: 5 }}>
            <div className="flex flex-col space-y-3 text-center">
              {isConnectedToStripe ? (
                <Paragraph>
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-green-500 mr-1"
                  />
                  Connected via stripe
                </Paragraph>
              ) : (
                <>
                  <Paragraph>
                    <FontAwesomeIcon
                      icon={faXmarkCircle}
                      className="text-red-500 mr-1"
                    />{" "}
                    Not connected
                  </Paragraph>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={transition.state === "submitting"}
                    isLoading={transition.state === "submitting"}
                  >
                    Connect via Stripe
                  </Button>
                </>
              )}
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
