import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import type Stripe from "stripe";
import invariant from "tiny-invariant";
import { activateSubscription } from "~/utils/subscription.server";

export async function action(args: ActionArgs) {
  const event = await args.request.json();
  invariant(event, "event is required for this endpoint");

  switch (event.type) {
    case "checkout.session.completed": {
      const completedCheckout: Stripe.Checkout.Session = event.data.object;
      // Then define and call a method to handle the successful checkout completed.
      handleCheckoutSessionCompleted(completedCheckout);
      break;
    }
    default:
      // Unexpected event type
      console.log(`Unhandled event type ${event.type}.`);
  }
  return json({ success: true });
}

async function handleCheckoutSessionCompleted(
  completedCheckout: Stripe.Checkout.Session
) {
  invariant(
    completedCheckout.metadata?.subscriptionId,
    "subscriptionId must be present on the checkout complete webhook"
  );
  invariant(
    typeof completedCheckout.subscription === "string",
    "subscription string must be present on checkout complete webhook"
  );
  await activateSubscription(
    completedCheckout.metadata.subscriptionId,
    completedCheckout.subscription
  );
}
