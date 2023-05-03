import type { LoaderArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { routes } from "~/routes";
import { authenticator } from "~/utils/auth.server";

export const loader = async ({ request, params }: LoaderArgs) => {
  const baseUrl = new URL(request.url).origin;
  invariant(params.provider, "provider is a required parameter");
  const returnTo = new URL(request.url).searchParams.get("returnTo");
  await authenticator.authenticate(params.provider, request, {
    successRedirect: returnTo ?? routes.home,
    context: {
      baseUrl
    }
  });

  return null;
};
