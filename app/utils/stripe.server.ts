import { Profile } from "@prisma/client";
import Stripe from "stripe";

export default class StripeHelper {
  private stripe: Stripe;

  constructor() {
    if (process.env.STRIPE_SK) {
      this.stripe = new Stripe(process.env.STRIPE_SK, {
        apiVersion: "2022-11-15",
      });
    } else {
      throw new Error("env variable STRIPE_SK is undefined");
    }
  }

  async createMentorPaymentProfile({
    returnURL,
    refreshURL,
    user,
  }: {
    returnURL: string;
    refreshURL: string;
    user: Profile;
  }) {
    const account = await this.stripe.accounts.create({
      type: "express",
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    const accountLink = await this.stripe.accountLinks.create({
      account: account.id,
      refresh_url: refreshURL,
      return_url: returnURL,
      type: "account_onboarding",
    });

    return { account, accountLink };
  }

  async checkIsAccountLinked(accountId: string): Promise<boolean> {
    const account = await this.stripe.accounts.retrieve(accountId);
    if (!account) return false;
    return account.charges_enabled;
  }

  async createProduct({
    name,
    amount,
    accountId,
  }: {
    name: string;
    amount: number;
    accountId: string;
  }) {
    const amountInCents = amount * 100;
    const product = await this.stripe.products.create(
      {
        name,
        default_price_data: {
          currency: "usd",
          unit_amount: amountInCents,
          recurring: { interval: "month" },
        },
      },
      {
        stripeAccount: accountId,
      }
    );
    return product;
  }

  async listProducts({ accountId }: { accountId: string }) {
    const products = await this.stripe.products.list(
      { expand: ["data.default_price"] },
      {
        stripeAccount: accountId,
      }
    );
    return products;
  }

  async createCustomer({
    email,
    name,
    linkedAccountId,
  }: {
    email: string;
    name: string;
    linkedAccountId: string;
  }) {
    const customer = await this.stripe.customers.create(
      { email, name },
      {
        stripeAccount: linkedAccountId,
      }
    );
    return customer;
  }

  async createCheckoutSessionLink({
    priceId,
    linkedAccountId,
    successUrl,
    subscriptionId,
    email,
  }: {
    priceId: string;
    linkedAccountId: string;
    successUrl: string;
    subscriptionId: string;
    email: string;
  }): Promise<Stripe.Checkout.Session> {
    const checkoutSession = await this.stripe.checkout.sessions.create(
      {
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        subscription_data: {
          application_fee_percent: 10,
        },
        customer_email: email,
        success_url: successUrl,
        mode: "subscription",
        metadata: {
          subscriptionId,
        },
      },
      { stripeAccount: linkedAccountId }
    );
    return checkoutSession as Stripe.Checkout.Session & {
      subscription: Stripe.Subscription;
    };
  }

  async createBillingPortalSession({
    customerId,
    returnUrl,
    linkedAccountId,
  }: {
    customerId: string;
    returnUrl: string;
    linkedAccountId: string;
  }) {
    const session = await this.stripe.billingPortal.sessions.create(
      {
        customer: customerId,
        return_url: returnUrl,
      },
      {
        stripeAccount: linkedAccountId,
      }
    );
    return session;
  }

  async cancelSubscription({
    subscriptionId,
    linkedAccountId,
  }: {
    subscriptionId: string;
    linkedAccountId: string;
  }) {
    const session = await this.stripe.subscriptions.del(subscriptionId, {
      stripeAccount: linkedAccountId,
    });
    return session;
  }
}
