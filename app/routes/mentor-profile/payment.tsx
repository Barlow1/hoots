/* eslint-disable no-nested-ternary */
import { Form, useLoaderData, useTransition } from "@remix-run/react";
import Button from "~/components/Buttons/IconButton";
import { H4, H5, Paragraph } from "~/components/Typography";
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
import invariant from "tiny-invariant";
import { createPlan, getPlansByMentorId } from "~/utils/plan.server";
import Field from "~/components/FormElements/Field";
import type Stripe from "stripe";

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
  const requestText = await request.text();
  const form = new URLSearchParams(requestText);
  const values = {
    action: form.get("action") ?? "",
    amount: form.get("amount") ?? "",
    numCalls: form.get("numCalls") ?? "",
  };

  if (values.action === "linkStripeAccount") {
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
  } else if (values.action === "createProduct") {
    invariant(
      mentorProfile.cost,
      "Must have cost defined on your mentor profile"
    );
    invariant(mentorProfile.stripeId, "Must have connected stripe account");
    const product = await stripe.createProduct({
      name: `${mentorProfile.name} Mentorship Plan`,
      amount: Number(values.amount),
      accountId: mentorProfile.stripeId,
    });
    await createPlan({
      stripeProductId: product.id,
      mentorProfileId: mentorProfile.id,
      numCalls: Number(values.numCalls),
    });
    if (product.url) return redirect(product.url);
  }
  return null;
};

export const loader = async ({ request }: LoaderArgs) => {
  let isConnectedToStripe = false;
  let mentorPlans;
  const mentorProfile = await requireMentorProfile(request);
  const stripe = new StripeHelper();
  if (mentorProfile.stripeId) {
    isConnectedToStripe = await stripe.checkIsAccountLinked(
      mentorProfile.stripeId
    );
    const plans = await getPlansByMentorId(mentorProfile.id);
    const products = await stripe.listProducts({
      accountId: mentorProfile.stripeId,
    });
    mentorPlans = plans
      .map((plan) => {
        const match = products.data.find(
          (product) => product.id === plan.stripeProductId
        );
        if (match) {
          return {
            ...plan,
            ...match,
          };
        }
        return null;
      })
      .filter((item) => item);
  }

  return json({ isConnectedToStripe, mentorPlans });
};

export default function NewMentorProfilePayment() {
  const transition = useTransition();
  const { isConnectedToStripe, mentorPlans } = useLoaderData<typeof loader>();

  const defaultPlan = mentorPlans?.[0];

  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <H4 className="mt-6 text-center font-bold tracking-tight">
          Payment Info
        </H4>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-white">
          Quickly setup your stripe account to get paid
        </p>
        <div className="mt-8 bg-white dark:bg-zinc-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
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
                <Form method="post" style={{ padding: 5 }}>
                  <input hidden name="action" value="linkStripeAccount" />
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={transition.state === "submitting"}
                    isLoading={transition.state === "submitting"}
                  >
                    Connect via Stripe
                  </Button>
                </Form>
              </>
            )}
          </div>
        </div>
        {isConnectedToStripe ? (
          <div>
            <H4 className="mt-6 text-center font-bold tracking-tight">Plans</H4>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-white">
              Setup your default plan
            </p>
            <div className="mt-8">
              {mentorPlans?.length && defaultPlan ? (
                <div className="bg-white dark:bg-zinc-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
                  <H5 className="font-bold tracking-tight text-center">
                    Default Plan
                  </H5>
                  <Paragraph className="text-center mt-4">
                    {defaultPlan.name}
                  </Paragraph>
                  <div className="mt-4 flex items-center justify-center">
                    <span className="flex items-start px-3 text-6xl tracking-tight text-gray-900 dark:text-white">
                      <span className="mt-2 mr-2 text-4xl font-medium tracking-tight">
                        $
                      </span>
                      <span className="font-bold">
                        {" "}
                        {((defaultPlan?.default_price as Stripe.Price)
                          ?.unit_amount ?? 0) / 100}
                      </span>
                    </span>
                    <span className="text-xl font-medium text-gray-500 dark:text-gray-400">
                      /month
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-center">
                    <ul className="list list-disc">
                      <li>Up to {defaultPlan.numCalls} calls per month</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-zinc-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
                  <Form method="post" style={{ padding: 5 }} className="w-full">
                    <input hidden name="action" value="createProduct" />
                    <div className="max-w-[200px] space-y-3">
                      <Field
                        min={0}
                        name="amount"
                        subLabel="Your monthly package amount to charge in US dollars"
                        label="Amount ($)"
                        type="number"
                        isRequired
                      />
                    </div>
                    <div className="max-w-[200px] space-y-3 mt-3">
                      <Field
                        min={1}
                        name="numCalls"
                        subLabel="Maximum number of calls you will accept on this plan"
                        label="Max Calls"
                        type="number"
                        isRequired
                      />
                    </div>
                    <Button
                      className="ml-0"
                      type="submit"
                      variant="primary"
                      disabled={transition.state === "submitting"}
                      isLoading={transition.state === "submitting"}
                    >
                      Create plan
                    </Button>
                  </Form>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
