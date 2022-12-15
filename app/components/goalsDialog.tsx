import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk, faXmark } from "@fortawesome/free-solid-svg-icons";
import type { Goal } from "@prisma/client";
import { useFetcher } from "@remix-run/react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Button from "./Buttons/IconButton";
import Field from "./FormElements/Field";

export interface GoalsDialogProps {
  userGoals: Goal[];
  isDialogOpen: boolean;
  setIsDialogOpen: Function;
  id: string;
}

export function GoalsDialog({
  userGoals,
  isDialogOpen,
  setIsDialogOpen,
  id,
}: GoalsDialogProps) {
  const onClose = () => {
    setIsDialogOpen(false);
  };
  const onSubmit = () => {
    const areRequiredInputsValid =
      nameRef.current?.value.length && dateRef.current?.value.length;
    if (areRequiredInputsValid) onClose();
  };
  const goal = userGoals.find((userGoal) => userGoal.id === id);
  const nameInput = goal?.name;
  const dateInput = goal?.dueDate;
  const notesInput = goal?.notes;
  const milestoneFetcher = useFetcher();
  const nameRef = React.useRef<HTMLInputElement>(null);
  const dateRef = React.useRef<HTMLInputElement>(null);

  return (
    <>
      <Transition.Root show={isDialogOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-zinc-800 px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <milestoneFetcher.Form method="post" action="/actions/goals">
                    <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                      <button
                        type="button"
                        className="rounded-md bg-white dark:bg-zinc-800 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:ring-offset-zinc-900"
                        onClick={onClose}
                      >
                        <span className="sr-only">Close</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="sm:items-start">
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <Dialog.Title
                          as="h3"
                          className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                        >
                          {id ? "Edit Goal" : "New Goal"}
                        </Dialog.Title>
                        <div className="mt-2">
                          <input hidden name="goalId" value={goal?.id} />
                          <input hidden name="method" value="post" />
                          <div className="space-y-3">
                            <Field
                              name="nameInput"
                              type="input"
                              label="Name"
                              placeholder="Enter new goal"
                              defaultValue={nameInput}
                              ref={nameRef}
                              isRequired
                            />
                            <Field
                              name="dateInput"
                              type="date"
                              label="Due"
                              placeholder="Enter Due Date"
                              defaultValue={dateInput}
                              ref={dateRef}
                              isRequired
                            />
                            <Field
                              name="notesInput"
                              type="textarea"
                              label="Notes"
                              placeholder="Enter notes for your goal"
                              defaultValue={notesInput}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 sm:mt-4 sm:flex justify-end">
                      <Button
                        variant="secondary"
                        onClick={onClose}
                        style={{ marginRight: "2rem" }}
                        rightIcon={
                          <FontAwesomeIcon
                            style={{ marginLeft: "1rem" }}
                            icon={faXmark}
                          />
                        }
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        type="submit"
                        onClick={onSubmit}
                        rightIcon={
                          <FontAwesomeIcon
                            style={{ marginLeft: "1rem" }}
                            icon={faFloppyDisk}
                          />
                        }
                      >
                        Save
                      </Button>
                    </div>
                  </milestoneFetcher.Form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}
