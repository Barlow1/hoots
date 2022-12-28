import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useTransition } from "@remix-run/react";
import Button from "~/components/Buttons/IconButton";
import Field from "~/components/FormElements/Field";
import { H2, Paragraph } from "~/components/Typography";
import { routes } from "~/routes";
import { requireUser } from "~/utils/user.session.server";
import { useMentorProfile, useUser } from "~/utils/useRootData";
import Logo from "../../assets/Logo.svg";

export const loader: LoaderFunction = async ({ request }) => {
  await requireUser(request);
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const url = new URL(request.url);
  const isSeekingMentor = Boolean(url.searchParams.get("seeking") === "true");
  const requestText = await request.text();
  const user = await requireUser(request);
  const form = new URLSearchParams(requestText);
  const parsedTags = (form.get("tags") ?? "").split(",");
  const values = {
    tags: parsedTags,
    bio: form.get("mentorBio") ?? "",
    company: form.get("company") ?? "",
    cost: form.get("cost") ?? "",
    occupation: form.get("occupation") ?? "",
    achievements: form.get("achievements") ?? "",
    mentoringGoal: form.get("mentoringGoal") ?? "",
    twitter: form.get("twitter") ?? "",
    website: form.get("website") ?? "",
    linkedIn: form.get("linkedIn") ?? "",
    github: form.get("github") ?? "",
    id: form.get("mentorID") ?? undefined,
    priorExperience: form.get("priorExperience") ?? "",
    experience: user.experience ?? 0,
    img: user.img,
    industry: user.industry ?? "",
    name: `${user.firstName} ${user.lastName}`,
    profileId: user.id,
  };
  let error: string | undefined;
  const data: { status: string } | undefined = undefined;
  const baseUrl = new URL(request.url).origin;

  const response = await fetch(`${baseUrl}/.netlify/functions/put-mentor`, {
    method: "PUT",
    body: JSON.stringify(values),
  })
    .then((userResp) => userResp.json())
    .catch(() => {
      console.error(
        "Failed to create mentor profile, please try again in a few minutes."
      );
    });
  if (response.error) {
    error = response.error;
  } else if (response.mentorProfile) {
    return redirect(
      isSeekingMentor
        ? routes.browse
        : `${routes.browse}/${response.mentorProfile.id}`
    );
  }
  return json({
    error,
    data,
  });
};

function NewMentorProfile() {
  const data = useLoaderData();
  const transition = useTransition();
  const mentorProfile = useMentorProfile();
  const user = useUser();

  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img className="mx-auto h-12 w-auto" src={Logo} alt="Hoots" />
        <H2 className="mt-6 text-center text-3xl font-bold tracking-tight">
          {mentorProfile ? "Edit Mentor Profile" : "New Mentor Profile"}
        </H2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-white">
          Let's get to know you so you can start helping mentees crush their
          goals!
        </p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-zinc-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Form method="post" style={{ padding: 5 }}>
            {mentorProfile ? (
              <input hidden name="mentorID" value={mentorProfile?.id} />
            ) : null}
            <div className="flex flex-col space-y-3">
              <Field
                label="Tags"
                subLabel="Comma separated list of your skills (tags)"
                type="input"
                name="tags"
                placeholder="Ex. Product Design, Javascript, Real Estate"
                defaultValue={mentorProfile?.tags}
                isRequired
              />
              <Field
                label="Company"
                subLabel="Current workplace or business"
                type="input"
                name="company"
                placeholder="Apple Inc."
                defaultValue={mentorProfile?.company}
                isRequired
              />
              <Field
                label="Occupation"
                subLabel="Current position or title"
                type="input"
                name="occupation"
                placeholder="Software Engineer"
                defaultValue={mentorProfile?.occupation}
                isRequired
              />
              <Field
                label="Cost ($)"
                subLabel="Your minimum monthly package cost in US dollars. (You can override this later.)"
                type="number"
                name="cost"
                placeholder="50"
                defaultValue={mentorProfile?.cost ?? undefined}
                isRequired
              />
              <Field
                name="mentorBio"
                type="textarea"
                label="Mentor Bio"
                subLabel="Tell us a little bit about your background and mention any mentee preferences. (This will be public.)"
                defaultValue={mentorProfile?.bio ?? user?.bio ?? undefined}
                placeholder="I work at...💼&#10;I have achieved...🏆&#10;I'm looking for a mentee who...🧑🏽‍🏫"
                isRequired
              />
              <Field
                name="priorExperience"
                type="textarea"
                label="Prior Experience"
                subLabel="What is your prior experience (if any) with mentoring or career coaching? (This will NOT be public.)"
                defaultValue={mentorProfile?.priorExperience ?? undefined}
                isRequired
              />
              <Field
                name="mentoringGoal"
                type="textarea"
                label="Mentoring Goal"
                subLabel="What is your goal as a mentor? (This will NOT be public.)"
                defaultValue={mentorProfile?.mentoringGoal ?? undefined}
                isRequired
              />
              <label className="block text-md font-medium text-gray-700 dark:text-gray-200">
                Social Media (Optional)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="block w-full border rounded-md border-gray-300 dark:text-white dark:border-gray-300/20 shadow-sm outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 bg-transparent dark:ring-offset-zinc-900 sm:text-sm px-4 py-2 leading-normal"
                  name="twitter"
                  placeholder="Twitter"
                  defaultValue={mentorProfile?.twitter ?? undefined}
                />
                <input
                  className="block w-full border rounded-md border-gray-300 dark:text-white dark:border-gray-300/20 shadow-sm outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 bg-transparent dark:ring-offset-zinc-900 sm:text-sm px-4 py-2 leading-normal"
                  name="website"
                  placeholder="Website"
                  defaultValue={mentorProfile?.website ?? undefined}
                />
                <input
                  className="block w-full border rounded-md border-gray-300 dark:text-white dark:border-gray-300/20 shadow-sm outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 bg-transparent dark:ring-offset-zinc-900 sm:text-sm px-4 py-2 leading-normal"
                  name="linkedIn"
                  placeholder="LinkedIn"
                  defaultValue={mentorProfile?.linkedIn ?? undefined}
                />
                <input
                  className="block w-full border rounded-md border-gray-300 dark:text-white dark:border-gray-300/20 shadow-sm outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 bg-transparent dark:ring-offset-zinc-900 sm:text-sm px-4 py-2 leading-normal"
                  name="github"
                  placeholder="Github"
                  defaultValue={mentorProfile?.github ?? undefined}
                />
              </div>
              <div className="flex space-x-4 flex-row items-center justify-end pt-5">
                <Paragraph textColorClassName="text-red-500">
                  {data?.error}
                </Paragraph>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={transition.state === "submitting"}
                >
                  Save
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default NewMentorProfile;
