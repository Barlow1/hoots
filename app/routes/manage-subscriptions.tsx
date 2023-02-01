import { XMarkIcon } from "@heroicons/react/24/outline";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { Form, useLoaderData, useTransition } from "@remix-run/react";
import Button from "~/components/Buttons/IconButton";
import { H3, H5, Paragraph } from "~/components/Typography";
import StripeHelper from "~/utils/stripe.server";
import {
  deactivateSubscription,
  getActiveSubscriptions,
} from "~/utils/subscription.server";
import { requireUser } from "~/utils/user.session.server";

export async function action({ request }: ActionArgs) {
  const requestText = await request.text();
  const form = new URLSearchParams(requestText);
  const values = {
    subscriptionId: form.get("subscriptionId") ?? "",
    stripeSubscriptionId: form.get("stripeSubscriptionId") ?? "",
    mentorStripeAccountId: form.get("mentorStripeAccountId") ?? "",
  };
  const stripe = new StripeHelper();

  await Promise.all([
    stripe.cancelSubscription({
      subscriptionId: values.stripeSubscriptionId,
      linkedAccountId: values.mentorStripeAccountId,
    }),
    deactivateSubscription(values.subscriptionId),
  ]);

  return null;
}

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);
  const subscriptions = await getActiveSubscriptions(user.id);
  return { subscriptions };
}

export default function ManageSubscriptions() {
  const { subscriptions } = useLoaderData<typeof loader>();
  const transition = useTransition();
  return (
    <div>
      <div className="space-y-8 mx-auto max-w-lg py-12 px-6">
        <H3 className="font-bold">Manage Subscriptions</H3>
        <div className="flex">
          {subscriptions.length ? (
            subscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="bg-white dark:bg-zinc-800 py-8 px-4 shadow sm:rounded-lg sm:px-10"
              >
                <H5 className="font-bold tracking-tight text-center">
                  {subscription.name}
                </H5>
                <Form method="post">
                  <input
                    hidden
                    name="mentorId"
                    value={subscription.mentorId ?? undefined}
                  />
                  <input
                    hidden
                    name="stripeSubscriptionId"
                    value={subscription.stripeSubscriptionId ?? undefined}
                  />
                  <input
                    hidden
                    name="subscriptionId"
                    value={subscription.id ?? undefined}
                  />
                  <input
                    hidden
                    name="mentorStripeAccountId"
                    value={subscription.stripeLinkedAccountId ?? undefined}
                  />
                  <div className="mt-4 flex items-center justify-center">
                    <span className="flex items-start px-3 text-6xl tracking-tight text-gray-900 dark:text-white">
                      <span className="mt-2 mr-2 text-4xl font-medium tracking-tight">
                        $
                      </span>
                      <span className="font-bold">
                        {" "}
                        {(subscription.costInCents ?? 0) / 100}
                      </span>
                    </span>
                    <span className="text-xl font-medium text-gray-500 dark:text-gray-400">
                      /month
                    </span>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="ml-0 w-full mt-4"
                    rightIcon={<XMarkIcon className="mr-0 ml-auto h-6 w-6" />}
                    disabled={transition.state === "submitting"}
                    isLoading={transition.state === "submitting"}
                  >
                    Cancel subscription
                  </Button>
                </Form>
              </div>
            ))
          ) : (
            <Paragraph> No Subscriptions found.</Paragraph>
          )}
        </div>
      </div>
    </div>
  );
}
