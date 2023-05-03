import type { ActionArgs } from "@remix-run/node";
import { authenticator } from "~/utils/auth.server";

export const action = async ({ request, params }: ActionArgs) => {
  await authenticator.logout(request, { redirectTo: "/login" });
};
