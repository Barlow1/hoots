import * as React from "react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { faFloppyDisk, faXmark } from "@fortawesome/free-solid-svg-icons";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  useFetcher,
  useLoaderData,
  useSubmit,
  useTransition,
} from "@remix-run/react";
import type { Goal, GoalMilestone } from "@prisma/client";
import { formatDateDisplay } from "~/utils/dates";
import { requireUser } from "~/utils/user.session.server";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { H1, H3, Paragraph } from "~/components/Typography";
import Button from "~/components/Buttons/IconButton";
import { calculateGoalProgress } from "~/utils/calculateGoalProgress";
import { GoalsDialog } from "~/components/goalsDialog";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon";
import Field from "~/components/FormElements/Field";

type Route = {
  data: { goal: Goal };
  params: { id: string };
};

export const loader: LoaderFunction = async ({ params, request }) => {
  await requireUser(request);
  const baseUrl = new URL(request.url).origin;
  const goal = await fetch(
    `${baseUrl}/.netlify/functions/get-goals?id=${params.id}`
  )
    .then((goals) => goals.json())
    .catch(() => {
      console.error("Failed to get goal, please try again in a few minutes.");
    });

  return json({ data: { goal: goal as Goal } });
};

export const action: ActionFunction = async ({ request }) => {
  const requestText = await request.text();
  const form = new URLSearchParams(requestText);
  const values = {
    name: form.get("name") ?? "",
    date: form.get("date") ?? "",
    notes: form.get("notes") ?? "",
    goalId: form.get("goalId") ?? "",
    formType: form.get("formType") ?? "",
    milestoneId: form.get("milestoneId") ?? "",
    completed: form.get("completed") ?? "",
  };
  const baseUrl = new URL(request.url).origin;
  let error;
  let data;
  let options;
  console.log("method", request.method);

  if (values.formType === FormType.DELETE) {
    options = {
      method: "DELETE",
      body: JSON.stringify({
        id: values.milestoneId,
      }),
    };
  } else if (values.formType === FormType.NEW) {
    options = {
      method: "PUT",
      body: JSON.stringify({
        name: values.name,
        notes: values.notes,
        date: values.date,
      }),
    };
  } else if (values.formType === FormType.EDIT) {
    options = {
      method: "PUT",
      body: JSON.stringify({
        name: values.name,
        notes: values.notes,
        date: values.date,
        id: values.milestoneId,
        completed: values.completed,
      }),
    };
  } else if (values.formType === FormType.COMPLETED) {
    options = {
      method: "PUT",
      body: JSON.stringify({
        id: values.milestoneId,
        completed: values.completed,
      }),
    };
  }

  try {
    console.log("options", options);
    const response = await fetch(
      `${baseUrl}/.netlify/functions/put-milestone?goalId=${values.goalId}&formType=${values.formType}`,
      options
    )
      .then((user) => user.json())
      .catch(() => {
        console.error(
          "Failed to edit milestone, please try again in a few minutes."
        );
      });
    if (response.error) {
      error = response.error;
    } else if (response.goal) {
      data = response.goal;
    }
    // eslint-disable-next-line no-shadow
  } catch (error) {
    console.error(error);
  }
  return json({
    error,
    data,
  });
};

const convertFormToMilestone = (form: FormData): GoalMilestone => {
  const milestone = Object.fromEntries(form);
  return {
    id: String(milestone.id),
    date: String(milestone.date),
    completed: Boolean(milestone.completed === "true"),
    name: String(milestone.name),
    notes: String(milestone.notes),
  };
};

function MilestonePage() {
  const { data } = useLoaderData<Route>();
  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const [milestoneBeingEditedId, setMilestoneBeingEditedId] = React.useState<
    string | undefined
  >(undefined);

  const openDrawer = (id: string | undefined) => {
    setMilestoneBeingEditedId(id);
    setIsDrawerOpen(true);
  };
  const onDrawerClose = () => {
    setIsDrawerOpen(false);
  };
  const openDialog = () => {
    setIsDialogOpen(true);
  };

  const submit = useSubmit();
  const transition = useTransition();
  const pendingSubmissionFormType = transition.submission
    ? transition.submission.formData.get("formType")
    : undefined;

  const onCheck = (
    e: React.ChangeEvent<HTMLInputElement>,
    milestoneId: string
  ) => {
    const formData = new FormData(e.target.form ?? undefined);
    formData.set("goalId", data.goal.id);
    formData.set("milestoneId", milestoneId);
    formData.set("formType", FormType.COMPLETED);
    formData.set("completed", String(e.target.checked));

    submit(formData, { replace: true, method: "post" });
  };

  const sortedMilestones = [...(data.goal?.milestones ?? [])].reverse();

  const milestoneBeingEdited = React.useMemo(
    () =>
      data.goal?.milestones.find(
        (milestone) => milestone.id === milestoneBeingEditedId
      ),
    [milestoneBeingEditedId, data.goal?.milestones]
  );

  const deleteFetcher = useFetcher();

  if (!data.goal || data.goal === undefined) {
    return <H1 className="text-red-600">Error Grabbing Goal Data</H1>;
  }
  const progress = calculateGoalProgress(data.goal.milestones) ?? 0;

  return (
    <div>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl lg:px-8">
        <div className="space-y-1">
          <H3>{data.goal?.name}</H3>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-300 sm:mt-0">
            <p>
              Due by{" "}
              <time dateTime={data.goal?.dueDate}>
                {formatDateDisplay(data.goal?.dueDate) ?? "-"}
              </time>
            </p>
          </div>
        </div>
        <div className="md:space-x-3 md:whitespace-nowrap whitespace-normal">
          <Button
            variant="secondary"
            onClick={openDialog}
            className="w-full mx-0 md:w-auto"
          >
            Edit
          </Button>
          <deleteFetcher.Form
            method="delete"
            className="block md:inline-block"
            action="/actions/goals"
          >
            <input hidden name="goalId" value={data.goal.id} />
            <input hidden name="method" value="delete" />
            <Button
              variant="danger"
              className="w-full mx-0 md:w-auto"
              type="submit"
            >
              {deleteFetcher.state === "submitting" ? "Deleting..." : "Delete"}
            </Button>
          </deleteFetcher.Form>
          <Button
            variant="primary"
            onClick={() => openDrawer(undefined)}
            rightIcon={<AddIcon style={{ marginLeft: "0.5em" }} />}
            className="w-full md:w-auto mx-0"
          >
            Add Milestone
          </Button>
        </div>
      </div>
      <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="shadow bg-gray-50 dark:bg-zinc-700 p-5 rounded-md">
            <div className="sm:flex">
              {progress < 100 && (
                <div className="w-full flex space-x-2">
                  <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-zinc-900 my-auto">
                    <div
                      className="bg-green-600 h-1.5 rounded-full dark:bg-green-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div>{progress}%</div>
                </div>
              )}
              {progress === 100 && "Complete 🎉"}
            </div>
            <label className="block text-md font-bold text-gray-700 dark:text-gray-200">
              Notes
            </label>
            <Paragraph>{data.goal?.notes ?? "-"}</Paragraph>
          </div>
        </div>
        <div className="overflow-hidden bg-white dark:bg-zinc-800 shadow sm:rounded-md lg:col-span-2 lg:col-start-2">
          <ul className="divide-y divide-gray-200 dark:divide-zinc-600">
            {transition.submission &&
              pendingSubmissionFormType === FormType.NEW && (
                <MilestoneItem
                  item={convertFormToMilestone(transition.submission.formData)}
                  openDrawer={openDrawer}
                  onCheck={onCheck}
                />
              )}
            {data.goal?.milestones &&
              sortedMilestones.map((item) => {
                let optimisticItem: GoalMilestone | undefined;
                if (
                  transition.submission &&
                  pendingSubmissionFormType === FormType.EDIT &&
                  item.id === milestoneBeingEditedId
                ) {
                  optimisticItem = convertFormToMilestone(
                    transition.submission.formData
                  );
                }
                return (
                  <MilestoneItem
                    key={`milestone-${item.id}`}
                    item={optimisticItem ?? item}
                    openDrawer={openDrawer}
                    onCheck={onCheck}
                  />
                );
              })}
            {!data.goal?.milestones ||
              (data.goal?.milestones.length === 0 && !transition.submission && (
                <Paragraph className="text-center pt-5">
                  No milestones found 😢 Add one now!
                </Paragraph>
              ))}
          </ul>
        </div>
      </div>
      <GoalsDialog
        userGoals={[data.goal]}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        id={data.goal.id}
      />
      <MilestoneDrawer
        goalId={data.goal.id}
        isDrawerOpen={isDrawerOpen}
        onDrawerClose={onDrawerClose}
        formType={milestoneBeingEditedId ? FormType.EDIT : FormType.NEW}
        milestoneBeingEdited={milestoneBeingEdited}
      />
    </div>
  );
}

export interface MilestoneItemProps {
  openDrawer: Function;
  onCheck: any;
  item: GoalMilestone;
}

export function MilestoneItem({
  openDrawer,
  onCheck,
  item,
}: MilestoneItemProps) {
  return (
    <li>
      <button
        type="button"
        className=" w-full block hover:bg-gray-50 dark:hover:bg-zinc-700 focus:outline-brand-500"
        onClick={(e) => {
          if ((e.target as HTMLSpanElement).className.includes("checkbox"))
            return;
          openDrawer(item.id);
        }}
      >
        <div className="px-4 py-4 sm:px-6">
          <div className="grid grid-cols-9 ">
            <div className="mr-auto items-center flex md:col-span-1">
              <input
                type="checkbox"
                checked={item.completed ?? false}
                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                onChange={(e) => {
                  // optimistic UI, remix will revalidate if the update fails
                  // eslint-disable-next-line no-param-reassign
                  item.completed = e.target.checked;
                  onCheck(e, item.id);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              />
            </div>
            <div className="col-span-8 md:grid md:grid-cols-8 items-center">
              <div className="flex items-center justify-between  md:col-span-4">
                <p className="truncate text-sm font-medium text-brand-600">
                  {item.name}
                </p>
              </div>
              <div className="mt-2 sm:flex sm:justify-between md:col-span-4">
                <div className="sm:flex" />
                <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-300 sm:mt-0">
                  <p>
                    Due by{" "}
                    <time dateTime={item.date}>
                      {formatDateDisplay(item.date)}
                    </time>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </button>
    </li>
  );
}

export interface MilestoneDrawerProps {
  goalId: string | undefined;
  isDrawerOpen: boolean;
  onDrawerClose: any;
  formType: FormType;
  milestoneBeingEdited: GoalMilestone | undefined;
}

// eslint-disable-next-line no-shadow
export enum FormType {
  NEW = "New",
  EDIT = "Edit",
  COMPLETED = "Completed",
  DELETE = "Delete",
}

export function MilestoneDrawer({
  goalId,
  isDrawerOpen,
  onDrawerClose,
  formType,
  milestoneBeingEdited,
}: MilestoneDrawerProps) {
  const deleteFetcher = useFetcher();
  const nameRef = React.useRef<HTMLInputElement>(null);
  const dateRef = React.useRef<HTMLInputElement>(null);

  const onSubmit = () => {
    const areRequiredInputsValid =
      nameRef.current?.value.length && dateRef.current?.value.length;
    if (areRequiredInputsValid) onDrawerClose();
  };

  return (
    <Transition.Root show={isDrawerOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onDrawerClose}>
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white dark:bg-zinc-800 py-6 shadow-xl">
                    <div className="px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white">
                          {formType === FormType.EDIT
                            ? "Details"
                            : "New Milestone"}
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="rounded-md bg-white dark:bg-zinc-800 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:ring-offset-zinc-900"
                            onClick={onDrawerClose}
                          >
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="relative mt-6 flex-1 px-4 sm:px-6">
                      <Form method="post">
                        <input hidden name="goalId" value={goalId} />
                        <input hidden name="formType" value={formType} />
                        <input
                          hidden
                          name="milestoneId"
                          value={milestoneBeingEdited?.id}
                        />
                        <input
                          hidden
                          name="completed"
                          value={String(milestoneBeingEdited?.completed)}
                        />
                        <div className="space-y-3">
                          <Field
                            name="name"
                            type="input"
                            label="Name"
                            ref={nameRef}
                            placeholder="Enter new milestone"
                            defaultValue={milestoneBeingEdited?.name}
                            isRequired
                          />
                          <Field
                            name="date"
                            type="date"
                            label="Due"
                            placeholder="Enter Due Date"
                            defaultValue={milestoneBeingEdited?.date}
                            ref={dateRef}
                            isRequired
                          />
                          <Field
                            name="notes"
                            type="textarea"
                            label="Notes"
                            placeholder="Enter notes for your milestone"
                            defaultValue={milestoneBeingEdited?.notes}
                          />
                          <Button
                            className="w-full mx-0"
                            variant="primary"
                            type="submit"
                            onClick={onSubmit}
                          >
                            Save
                            <FontAwesomeIcon
                              style={{ marginLeft: "1rem" }}
                              icon={faFloppyDisk}
                            />
                          </Button>
                        </div>
                      </Form>
                      <deleteFetcher.Form method="delete">
                        <div className="mt-3 flex-row flex space-x-3">
                          <Button
                            variant="secondary"
                            className="w-full mx-0"
                            onClick={onDrawerClose}
                          >
                            Cancel
                            <FontAwesomeIcon
                              style={{ marginLeft: "1rem" }}
                              icon={faXmark}
                            />
                          </Button>
                          <Button
                            className="w-full mx-0"
                            variant="danger"
                            type="submit"
                            onClick={onDrawerClose}
                          >
                            <input hidden name="goalId" value={goalId} />
                            <input
                              hidden
                              name="milestoneId"
                              value={milestoneBeingEdited?.id}
                            />
                            <input
                              hidden
                              name="formType"
                              value={FormType.DELETE}
                            />
                            {deleteFetcher.state === "submitting"
                              ? "Deleting..."
                              : "Delete"}
                            <DeleteIcon
                              style={{ color: "white", marginLeft: "1rem" }}
                            />
                          </Button>
                        </div>
                      </deleteFetcher.Form>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
export default MilestonePage;
