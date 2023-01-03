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
}
