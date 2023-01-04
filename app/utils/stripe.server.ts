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
    linkedAccountId,
  }: {
    email: string;
    linkedAccountId: string;
  }) {
    const customer = await this.stripe.customers.create(
      { email },
      {
        stripeAccount: linkedAccountId,
      }
    );
    return customer;
  }

  async createSubscriptionPaymentLink({
    priceId,
    linkedAccountId,
  }: {
    priceId: string;
    linkedAccountId: string;
  }): Promise<Stripe.PaymentLink> {
    const paymentLink = await this.stripe.paymentLinks.create(
      {
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
      },
      { stripeAccount: linkedAccountId }
    );
    return paymentLink;
  }
}
