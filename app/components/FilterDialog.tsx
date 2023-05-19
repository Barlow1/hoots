import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import ReactSlider from "react-slider";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { IndustryList } from "~/constants";
import { useFetcher, useSearchParams } from "@remix-run/react";
import Button from "./Buttons/IconButton";
import Logo from "../assets/Logo.svg";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";
import Select from "./FormElements/Select";

const MAX_MENTOR_COST = 500;

interface FilterDialogProps {
  defaultValues: FilterValues;
  action: string;
}

export interface FilterValues {
  min_cost?: string;
  max_cost?: string;
  industry?: string[];
}

function FilterDialog({ defaultValues, action }: FilterDialogProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const onClose = () => setIsOpen(false);
  const [minSliderTooltip, setMinSliderTooltip] = useState<any>("FREE");
  const [maxSliderTooltip, setMaxSliderTooltip] = useState<any>("💰💰💰💰💰");
  const [minCostValue, setMinCostValue] = useState<number>(
    defaultValues.min_cost ? Number(defaultValues.min_cost) : 0
  );
  const [maxCostValue, setMaxCostValue] = useState<number>(
    defaultValues.max_cost ? Number(defaultValues.max_cost) : MAX_MENTOR_COST
  );

  const [hasPriceFilterBeenChanged, setHasPriceFilterBeenChanged] =
    useState(false);

  const fetcher = useFetcher();

  const [prevSearchParams] = useSearchParams();

  const handleSave = () => {
    onClose();
  };

  const [showTooltip, setShowTooltip] = useState(false);
  const onCostSliderChange = (vals: number[]) => {
    vals.forEach((val, index) => {
      const setSliderTooltip =
        index === 0 ? setMinSliderTooltip : setMaxSliderTooltip;
      const setValue = index === 0 ? setMinCostValue : setMaxCostValue;
      setValue(val);
      const percentage = (val / MAX_MENTOR_COST) * 100;
      if (percentage === 0) {
        setSliderTooltip("Free");
      } else if (percentage <= 30) {
        setSliderTooltip("💰");
      } else if (percentage > 30 && percentage <= 50) {
        setSliderTooltip("💰💰");
      } else if (percentage > 50 && percentage <= 70) {
        setSliderTooltip("💰💰💰");
      } else if (percentage > 70 && percentage <= 90) {
        setSliderTooltip("💰💰💰💰");
      } else {
        setSliderTooltip("💰💰💰💰💰");
      }
    });
  };

  const onMinCostValueChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setMinCostValue(Number(event.target.value));
  };
  const onMaxCostValueChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setMaxCostValue(Number(event.target.value));
  };
  return (
    <>
      <Tooltip>
        <TooltipTrigger className="ml-0">
          <Button
            className="ml-0"
            leftIcon={<FontAwesomeIcon icon={faFilter} />}
            aria-label="Edit Filters"
            onClick={() => setIsOpen(true)}
          />
        </TooltipTrigger>
        <TooltipContent>Edit Filters</TooltipContent>
      </Tooltip>
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setIsOpen}>
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
                <Dialog.Panel className="relative transform rounded-lg bg-white dark:bg-zinc-800 px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 overflow-visible">
                  <fetcher.Form action={action} method="POST">
                    <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                      <button
                        type="button"
                        className="rounded-md bg-white dark:bg-zinc-800 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:ring-offset-zinc-900"
                        onClick={() => setIsOpen(false)}
                      >
                        <span className="sr-only">Close</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="sm:flex sm:items-start">
                      <div className="flex flex-col mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left space-y-8">
                        <Dialog.Title
                          as="h3"
                          className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                        >
                          Edit Filters
                        </Dialog.Title>
                        <div>
                          <label
                            htmlFor="mentorCost"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Monthly Cost ($)
                          </label>
                          <div
                            className="p-3"
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                          >
                            <ReactSlider
                              step={1}
                              min={0}
                              max={MAX_MENTOR_COST}
                              onBeforeChange={() =>
                                setHasPriceFilterBeenChanged(true)
                              }
                              className="w-full h-1 pr-2 my-2 bg-gray-200 dark:bg-zinc-700 rounded-md cursor-grab"
                              thumbClassName="absolute w-5 h-5 cursor-grab bg-indigo-500 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 dark:ring-offset-zinc-800 -top-[6px]"
                              renderThumb={(props, state) => (
                                <div
                                  {...props}
                                  onFocus={(e) => {
                                    props.onFocus?.(e);
                                    setShowTooltip(true);
                                  }}
                                  onBlur={(e) => {
                                    props.onBlur?.(e);
                                    setShowTooltip(false);
                                  }}
                                >
                                  <Tooltip isOpen={showTooltip} isAnimated>
                                    <TooltipTrigger>
                                      <img src={Logo} alt="Hoots Logo" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {state.index
                                        ? maxSliderTooltip
                                        : minSliderTooltip}
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              )}
                              value={[minCostValue, maxCostValue]}
                              onChange={onCostSliderChange}
                            />
                          </div>
                          <div className="flex gap-2">
                            <div>
                              <label
                                htmlFor="minimum"
                                className="block mb-2 text-xs font-medium text-gray-900 dark:text-white"
                              >
                                Minimum
                              </label>
                              <input
                                className="block w-full rounded-md dark:text-white dark:bg-zinc-700 h-8 border-gray-300 dark:border-gray-300/10 pl-7 pr-12 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:ring-offset-zinc-900 sm:text-sm"
                                type="number"
                                id="minimum"
                                name="min_cost"
                                placeholder="0"
                                value={hasPriceFilterBeenChanged ? minCostValue : undefined}
                                min={0}
                                onChange={onMinCostValueChange}
                              />
                            </div>
                            <div>
                              <label
                                htmlFor="maximum"
                                className="block mb-2 text-xs font-medium text-gray-900 dark:text-white"
                              >
                                Maximum
                              </label>
                              <input
                                className="block w-full rounded-md dark:text-white dark:bg-zinc-700 h-8 border-gray-300 dark:border-gray-300/10 pl-7 pr-12 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:ring-offset-zinc-900 sm:text-sm"
                                type="number"
                                id="maximum"
                                name="max_cost"
                                placeholder={`${MAX_MENTOR_COST}+`}
                                value={hasPriceFilterBeenChanged ? maxCostValue : undefined}
                                min={0}
                                onChange={onMaxCostValueChange}
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label
                            htmlFor="industry"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Industry
                          </label>
                          <Select
                            name="industry"
                            defaultValue={defaultValues.industry ?? undefined}
                            placeholder="Industry"
                            label=""
                            options={IndustryList}
                            className="my-2"
                            multiple
                          />
                        </div>
                      </div>
                    </div>
                    <input
                      hidden
                      readOnly
                      name="prevSearchParams"
                      value={JSON.stringify(
                        Object.fromEntries(prevSearchParams.entries())
                      )}
                    />
                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                      <button
                        type="submit"
                        className="inline-flex w-full justify-center rounded-md border border-transparent bg-brand-700 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:ring-offset-zinc-800 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={handleSave}
                      >
                        Apply
                      </button>
                    </div>
                  </fetcher.Form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}

export default FilterDialog;
