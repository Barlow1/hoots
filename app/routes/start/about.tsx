/* eslint-disable camelcase */
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import type { ChangeEvent } from "react";
import { useState } from "react";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
// eslint-disable-next-line import/no-extraneous-dependencies
import { json, redirect } from "@remix-run/server-runtime";
import {
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import { getUserSession, requireUser } from "~/utils/user.session.server";
import { useUser } from "~/utils/useRootData";
import { uploadImageToCloudinary } from "~/utils/images.server";
import { H2, Paragraph } from "~/components/Typography";
import Avatar from "~/components/Avatar";
import Field from "~/components/FormElements/Field";
import Button from "~/components/Buttons/IconButton";
import Select from "~/components/FormElements/Select";
import { routes } from "../../routes";
import Logo from "../../assets/Logo.svg";

export const action: ActionFunction = async ({
  request,
}: {
  request: Request;
  // eslint-disable-next-line consistent-return
}) => {
  const user = await requireUser(request);
  const uploadHandler = unstable_composeUploadHandlers(
    // our custom upload handler
    async ({ name, contentType, data, filename }) => {
      if (name !== "profilePhoto") {
        return undefined;
      }
      if (filename) {
        const uploadedImage = await uploadImageToCloudinary(
          data,
          `profile/${user.id}`
        );
        return uploadedImage.secure_url;
      }
      return undefined;
    },
    // fallback to memory for everything else
    unstable_createMemoryUploadHandler()
  );
  try {
    const form = await unstable_parseMultipartFormData(request, uploadHandler);

    const url = new URL(request.url);
    const shouldCreateMentorProfile = Boolean(
      url.searchParams.get("create") === "true"
    );
    console.log("img_url", form.get("profilePhoto"));
    const values = {
      industry: form.get("industry") ?? "",
      experience: Number(form.get("experience") ?? ""),
      mentorExperience: Number(form.get("mentorExperience") ?? ""),
      mentorCost: Number(form.get("mentorCost") ?? ""),
      bio: form.get("bio") ?? "",
      img:
        typeof form.get("profilePhoto") === "string"
          ? form.get("profilePhoto")
          : undefined,
    };
    let error: string | undefined;
    let data: { status: string } | undefined;
    const baseUrl = new URL(request.url).origin;
    console.log("required user", user);
    const response = await fetch(
      `${baseUrl}/.netlify/functions/put-user?id=${user?.id}`,
      {
        method: "PUT",
        body: JSON.stringify(values),
      }
    ).then((resp) => resp.json());
    if (response.error) {
      error = response.error;
    } else if (response.user) {
      const { user: userResp } = response;
      const userSession = await getUserSession(request);
      userSession.setUser(userResp);
      data = { status: "success" };
      if (shouldCreateMentorProfile) {
        return redirect(`${routes.mentorProfile}${url.search}`, {
          headers: { "Set-Cookie": await userSession.commit() },
        });
      }
      return redirect(routes.browse, {
        headers: { "Set-Cookie": await userSession.commit() },
      });
    }

    return json({
      error,
      data,
    });
  } catch {
    console.error("Failed to put user, please try again in a few minutes.");
  }
};

export const loader: LoaderFunction = async ({ request }) => {
  await requireUser(request);
  const url = new URL(request.url);
  const shouldCreateMentorProfile = Boolean(
    url.searchParams.get("create") === "true"
  );
  const isSeekingMentor = Boolean(url.searchParams.get("seeking") === "true");
  return json({ shouldCreateMentorProfile, isSeekingMentor });
};

function Preferences() {
  const IndustryList = [
    { id: "0", name: "Marketing" },
    { id: "1", name: "Engineering" },
    { id: "2", name: "Product Design" },
    { id: "3", name: "Small Business" },
  ];
  const user = useUser();
  const data = useActionData();
  const transition = useTransition();
  const [uploadedProfilePhoto, setUploadProfilePhoto] = useState<
    File | undefined
  >();
  const { isSeekingMentor } = useLoaderData();

  const onProfilePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUploadProfilePhoto(event.target.files?.[0]);
  };
  const profilePhotoUrl = uploadedProfilePhoto
    ? URL.createObjectURL(uploadedProfilePhoto)
    : user?.img ?? undefined;
  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img className="mx-auto h-12 w-auto" src={Logo} alt="Hoots" />
        <H2 className="mt-6 text-center text-3xl font-bold tracking-tight">
          About Me
        </H2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-white">
          A few things we recommend adding to your profile
        </p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-zinc-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Form
            method="post"
            style={{ padding: 5 }}
            encType="multipart/form-data"
          >
            <div className="flex flex-col space-y-3">
              <div className="flex flex-col space-y-2 mb-2">
                <label className="block text-md font-medium text-gray-700 dark:text-gray-200">
                  Profile Photo
                </label>
                <Avatar src={profilePhotoUrl} size="md" />
              </div>
              <label className="block">
                <span className="sr-only">Choose profile photo</span>
                <input
                  name="profilePhoto"
                  type="file"
                  accept="image/png, image/gif, image/jpeg"
                  onChange={onProfilePhotoChange}
                  className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-violet-50 file:text-brand-700
                  cursor-pointer file:cursor-pointer
                  hover:file:bg-brand-100"
                />
              </label>

              <Select
                name="industry"
                defaultValue={user?.industry ?? undefined}
                placeholder="Select Industry"
                isRequired
                label="Industry"
                options={IndustryList}
              />
              <Field
                type="number"
                min={0}
                defaultValue={user?.experience ?? undefined}
                name="experience"
                placeholder="Years of Experience"
                label="Experience (Years)"
                isRequired
              />
              <Field
                name="bio"
                type="textarea"
                label="Tell us about yourself"
                defaultValue={user?.bio ?? undefined}
                placeholder="I work at...💼&#10;I am currently learning...📚&#10;I'm looking for a mentor with skills in...🧑🏽‍🏫"
                isRequired
              />
              <div className="flex space-x-4 flex-row items-center justify-end pt-5">
                <Paragraph textColorClassName="text-red-500">
                  {data?.error}
                </Paragraph>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={transition.state === "submitting"}
                >
                  Next
                </Button>
                <Link to={isSeekingMentor ? routes.browse : routes.home}>
                  <Button>Skip</Button>
                </Link>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default Preferences;
