import { faEnvelope, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Mentor, Profile } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import type { ActionFunction, LoaderArgs } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { Form, useLoaderData, useTransition } from "@remix-run/react";
import type Stripe from "stripe";
import invariant from "tiny-invariant";
import Avatar from "~/components/Avatar";
import Button from "~/components/Buttons/IconButton";
import { H3, H5, Paragraph } from "~/components/Typography";
import { routes } from "~/routes";
import { getPlansByMentorId } from "~/utils/plan.server";
import StripeHelper from "~/utils/stripe.server";
import { createSubscription } from "~/utils/subscription.server";
import { requireUser } from "~/utils/user.session.server";

type LoaderData = typeof loader;

export const action: ActionFunction = async ({ request }) => {
  const baseUrl = new URL(request.url).origin;
  const requestText = await request.text();
  const form = new URLSearchParams(requestText);
  const values = {
    stripePriceId: form.get("stripePriceId") ?? "",
    mentorStripeAccountId: form.get("mentorStripeAccountId") ?? "",
    mentorId: form.get("mentorId") ?? "",
    mentorFirstName: form.get("mentorFirstName") ?? "",
    mentorLastName: form.get("mentorLastName") ?? "",
    costInCents: Number(form.get("costInCents") ?? ""),
  };
  const user = await requireUser(request);
  const stripe = new StripeHelper();

  invariant(values.stripePriceId, "stripe price id is required");
  invariant(
    values.mentorStripeAccountId,
    "mentor stripe account id is required"
  );

  const customer = await stripe.createCustomer({
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
    linkedAccountId: values.mentorStripeAccountId,
  });

  const subscription = await createSubscription({
    userId: user.id,
    mentorId: values.mentorId,
    stripeCustomerId: customer.id,
    stripeLinkedAccountId: values.mentorStripeAccountId,
    name:
      values.mentorFirstName && values.mentorLastName
        ? `${values.mentorFirstName} ${values.mentorLastName} Mentorship Plan`
        : "Unknown subscription",
    stripePriceId: values.stripePriceId,
    costInCents: values.costInCents,
  });

  const paymentLink = await stripe.createCheckoutSessionLink({
    priceId: values.stripePriceId,
    email: user.email,
    linkedAccountId: values.mentorStripeAccountId,
    successUrl: `${baseUrl}${routes.manageSubscriptions}`,
    subscriptionId: subscription.id,
  });

  return redirect(paymentLink.url ?? "/");
};

export const loader = async ({ request, params }: LoaderArgs) => {
  const user = await requireUser(request);
  const baseUrl = new URL(request.url).origin;
  const prisma = new PrismaClient();
  const mentor = await fetch(
    `${baseUrl}/.netlify/functions/get-mentor?id=${params.id}`
  )
    .then((mentors) => mentors.json())
    .catch(() => {
      console.error("Failed to get mentor, please try again in a few minutes.");
    });
  prisma
    .$connect()
    .catch((err) => console.error("Failed to connect to db", err));
  const freshUser = await prisma.profile.findUnique({
    where: {
      id: user.id,
    },
  });
  if (!freshUser || !freshUser.mentorIDs.includes(mentor.id)) {
    return redirect(routes.home);
  }
  const stripe = new StripeHelper();
  const plans = await getPlansByMentorId(mentor.id);
  const products = await stripe.listProducts({
    accountId: mentor.stripeId,
  });
  const mentorPlans = plans
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

  return json({
    data: {
      mentor: mentor as Mentor & {
        profile: Profile | null;
      },
      mentorPlans,
    },
  });
};

export default function Apply() {
  const { data } = useLoaderData<LoaderData>();
  const { mentor, mentorPlans } = data;
  const defaultPlan = mentorPlans?.[0];
  const mentorFirstName = mentor.name.split(" ")[0] ?? "your mentor";
  const transition = useTransition();
  return (
    <div>
      <div className="space-y-8 mx-auto max-w-lg py-12 px-6">
        <H3 className="font-bold">Subscribe to</H3>
        <div className="flex">
          <Avatar src={mentor.img ?? undefined} />
          <Paragraph className="text-lg text-gray-600 dark:text-gray-200 self-center ml-3">
            {mentor.name}
          </Paragraph>
        </div>
        <Paragraph>
          Congratulations! Your mentorship application was approved by{" "}
          {mentorFirstName}. Start your subscription to begin crushing your
          goals! (You can cancel at any&nbsp;time.)
        </Paragraph>
        {defaultPlan ? (
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
                  {((defaultPlan.default_price as Stripe.Price).unit_amount ??
                    0) / 100}
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
            <Form method="post">
              <input hidden name="mentorEmail" value={mentor.profile?.email} />
              <input
                hidden
                name="mentorFirstName"
                value={mentor.profile?.firstName}
              />
              <input
                hidden
                name="mentorLastName"
                value={mentor.profile?.lastName}
              />
              <input hidden name="mentorId" value={mentor.id} />
              <input
                hidden
                name="stripePriceId"
                value={(defaultPlan.default_price as Stripe.Price).id}
              />
              <input
                hidden
                name="costInCents"
                value={
                  (defaultPlan.default_price as Stripe.Price).unit_amount ??
                  undefined
                }
              />
              <input
                hidden
                name="mentorStripeAccountId"
                value={mentor.stripeId ?? undefined}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full m-0 mt-4"
                rightIcon={
                  <FontAwesomeIcon
                    icon={faPaperPlane}
                    style={{ marginLeft: "0.5em" }}
                  />
                }
                disabled={transition.state === "submitting"}
                isLoading={transition.state === "submitting"}
              >
                Subscribe
              </Button>
            </Form>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <Paragraph className="text-center text-sm">
              No plans found, contact {mentorFirstName} for next steps.
            </Paragraph>
            <a
              href={`mailto:${mentor.profile?.email}?subject=Hoots%20Mentorship`}
            >
              <Button
                variant="primary"
                className="w-full m-0 mt-4"
                rightIcon={
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    style={{ marginLeft: "0.5em" }}
                  />
                }
              >
                Send Email
              </Button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
