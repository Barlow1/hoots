import { Form, useActionData, useTransition } from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
// eslint-disable-next-line import/no-extraneous-dependencies
import { redirect } from "@remix-run/server-runtime";
import { H1, Paragraph } from "~/components/Typography";
import { routes } from "~/routes";
import { createVerificationLink } from "~/utils/email-verification.server";
import { sendEmail } from "~/utils/email.server";
import { getUser } from "~/utils/user.session.server";
import Logo from "../../assets/Logo.svg";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  if (user.verified) {
    throw redirect(routes.start);
  }
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const baseUrl = new URL(request.url).origin;
  const user = await getUser(request);
  const verificationLink = createVerificationLink({
    email: user.email,
    domainUrl: baseUrl,
  });
  await sendEmail({
    toName: `${user.firstName} ${user.lastName}`,
    fromName: "Hoots",
    email: user.email,
    subject: "Email Verification",
    variables: {
      firstName: user.firstName,
      verificationLink,
    },
    template: "email-verification",
  });
  return true;
};
function CheckEmail() {
  const transition = useTransition();
  const newEmailSent = useActionData();
  return (
    <div className="min-h-screen content-center items-center flex">
      <div className="space-y-8 mx-auto max-w-lg py-12 px-6">
        <div className="flex items-center flex-col space-y-8 ">
          <img className="mx-auto h-12 w-auto" src={Logo} alt="Hoots" />
          <H1>Email Verification</H1>
          <Paragraph>Check your email for a verification link.</Paragraph>
          <Form method="post">
            {transition.state === "idle" && !newEmailSent && (
              <Paragraph className="text-sm">
                Don't see it?{" "}
                <button
                  type="submit"
                  className="font-medium text-brand-600 hover:text-brand-500 ml-2"
                >
                  Send it again
                </button>
              </Paragraph>
            )}
            {transition.state === "idle" && newEmailSent && (
              <Paragraph className="text-sm">Sent</Paragraph>
            )}
            {transition.state !== "idle" && (
              <Paragraph className="text-sm">Sending...</Paragraph>
            )}
          </Form>
        </div>
      </div>
    </div>
  );
}

export default CheckEmail;
