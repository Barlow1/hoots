import {
  faMagnifyingGlass,
  faPersonCirclePlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Form, Link, useActionData, useTransition } from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
// eslint-disable-next-line import/no-extraneous-dependencies
import { redirect } from "@remix-run/server-runtime";
import React from "react";
import Button from "~/components/Buttons/IconButton";
import LargeCheckBox from "~/components/LargeCheckBox";
import { H4, Paragraph } from "~/components/Typography";
import { routes } from "~/routes";
import isObject from "~/utils/isObject";
import { requireUser } from "~/utils/user.session.server";
import Logo from "../../assets/Logo.svg";

const SEEKING_MENTOR = "SeekingMentor";
const CREATE_MENTOR_PROFILE = "CreateMentorProfile";
const USER_START_OPTIONS = "UserStartOptions";

export type EventOrValue =
  | React.ChangeEvent<HTMLInputElement>
  | string
  | number;

function isInputEvent(value: any): value is { target: HTMLInputElement } {
  return value && isObject(value) && isObject(value.target);
}

export const loader: LoaderFunction = async ({ request }) => {
  await requireUser(request);
  return null;
};

// eslint-disable-next-line consistent-return
export const action: ActionFunction = async ({ request }) => {
  const requestText = await request.text();
  const form = new URLSearchParams(requestText);
  const userStartOptions: string[] = JSON.parse(
    form.get(USER_START_OPTIONS) ?? "[]"
  );
  const isUserSeekingMentor = userStartOptions.includes(SEEKING_MENTOR);
  const isUserCreatingMentorProfile = userStartOptions.includes(
    CREATE_MENTOR_PROFILE
  );
  if (isUserSeekingMentor && isUserCreatingMentorProfile) {
    return redirect(`${routes.startAbout}?create=true&seeking=true`);
  }
  if (isUserSeekingMentor) {
    return redirect(`${routes.startAbout}?create=false&seeking=true`);
  }
  if (isUserCreatingMentorProfile) {
    return redirect(`${routes.startAbout}?create=true&seeking=false`);
  }
};

function Start() {
  const data = useActionData();
  const transition = useTransition();

  const [value, setValue] = React.useState<(string | number)[]>([]);

  const handleChange = React.useCallback(
    (eventOrValue: EventOrValue) => {
      if (!value) return;

      const isChecked = isInputEvent(eventOrValue)
        ? eventOrValue.target.checked
        : !value.includes(eventOrValue);

      const selectedValue = isInputEvent(eventOrValue)
        ? eventOrValue.target.value
        : eventOrValue;

      const nextValue = isChecked
        ? [...value, selectedValue]
        : value.filter((v) => String(v) !== String(selectedValue));

      console.log(nextValue);

      setValue(nextValue);
    },
    [setValue, value]
  );

  return (
    <div className="flex min-h-screen content-center items-center justify-center">
      <div className="flex  flex-col space-y-8 mx-auto max-w-lg py-12 px-6">
        <div className="flex  flex-col content-center items-center">
          <img className="mx-auto h-12  w-auto" src={Logo} alt="Hoots" />
          <H4>How can we help?</H4>
          <Paragraph textColorClassName="dark:text-gray-300 text-gray-600">
            – Select one or more options to get started –
          </Paragraph>
        </div>
        <div className="rounded-lg dark:bg-gray-700 shadow-lg p-8">
          <Form method="post">
            <Paragraph textColorClassName="dark:text-white">
              I want to...
            </Paragraph>
            <input
              readOnly
              value={JSON.stringify(value)}
              hidden
              name={USER_START_OPTIONS}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-5">
              <div>
                <LargeCheckBox
                  label="Find a mentor"
                  name={SEEKING_MENTOR}
                  onChange={handleChange}
                  icon={
                    <FontAwesomeIcon
                      icon={faMagnifyingGlass}
                      size="2x"
                      color="#718096"
                    />
                  }
                />
              </div>
              <div>
                <LargeCheckBox
                  label="Create a mentor profile"
                  name={CREATE_MENTOR_PROFILE}
                  onChange={handleChange}
                  icon={
                    <FontAwesomeIcon
                      icon={faPersonCirclePlus}
                      size="2x"
                      color="#718096"
                    />
                  }
                />
              </div>
            </div>

            <div className="flex space-x-4 flex-row items-center justify-end pt-5">
              <Paragraph textColorClassName="text-red-500">
                {data?.error}
              </Paragraph>
              <Button
                type="submit"
                disabled={!value.length}
                variant="primary"
                isLoading={transition.state === "submitting"}
              >
                Next
              </Button>
              <Link to={routes.home}>
                <Button>Skip</Button>
              </Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default Start;
