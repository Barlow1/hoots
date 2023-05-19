/* eslint-disable no-shadow */
import { Fragment, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";

interface Option {
  id: string;
  name: string;
  emoji?: string;
}

type SelectProps<TMultiple = boolean> = TMultiple extends false
  ? React.PropsWithChildren<{
      options: Option[];
      name: string;
      label: string;
      defaultValue?: string;
      placeholder?: string;
      isRequired?: boolean;
      className?: string;
      multiple?: TMultiple;
    }>
  : React.PropsWithChildren<{
      options: Option[];
      name: string;
      label: string;
      defaultValue?: string[];
      placeholder?: string;
      isRequired?: boolean;
      className?: string;
      multiple?: TMultiple;
    }>;
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
const hasName = (value: any): value is Option =>
  !!value && typeof value.name !== "undefined";

export default function Select(props: SelectProps) {
  const {
    options,
    defaultValue,
    name,
    label,
    placeholder,
    isRequired = false,
    className,
    multiple = false,
  }: SelectProps = props;

  if (
    multiple &&
    typeof defaultValue !== "undefined" &&
    !Array.isArray(defaultValue)
  ) {
    throw new Error(
      "Expected defaultValue prop to be of type `string[]` when the multiple prop is true"
    );
  }

  const getDefaultSelected = () =>
    multiple
      ? options.filter((opt) => defaultValue?.includes(opt.name))
      : options.find((opt) => opt.name === defaultValue);

  const [selected, setSelected] = useState(getDefaultSelected());

  const getDisplayValue = () => {
    if (multiple && selected && Array.isArray(selected)) {
      return selected.length
        ? selected.reduce(
            (prev, curr, indx) =>
              indx === 0 ? prev + curr.name : `${prev}, ${curr.name}`,
            ``
          )
        : placeholder;
    }
    if (selected && hasName(selected)) {
      return selected.name;
    }
    return placeholder;
  };

  return (
    <Listbox value={selected} onChange={setSelected} multiple={multiple}>
      {({ open }) => (
        <>
          <Listbox.Label className="block text-md font-medium text-gray-700 dark:text-gray-200">
            {label}
            {isRequired && <span className="text-red-400 ml-px">*</span>}
          </Listbox.Label>
          <div className="relative mt-1">
            <Listbox.Button
              className={clsx(
                "relative w-full cursor-default rounded-md border border-gray-300 bg-transparent py-2 pl-3 pr-10 text-left shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:ring-offset-2 dark:ring-offset-zinc-900 dark:text-white dark:border-gray-300/20 sm:text-sm",
                { "text-[#6f7683] dark:text-[#6f7683]": !selected },
                className
              )}
            >
              <span className="block truncate">{getDisplayValue()} </span>
              <input
                name={name}
                value={
                  multiple && Array.isArray(selected)
                    ? selected.map((opt) => opt.name)
                    : (selected as Option)?.name
                }
                required={isRequired}
                multiple={multiple}
                readOnly
                hidden
              />
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {options.map((option) => (
                  <Listbox.Option
                    key={option.id}
                    className={({ active }) =>
                      classNames(
                        active ? "text-white bg-indigo-600" : "text-gray-900",
                        "relative cursor-default select-none py-2 pl-3 pr-9"
                      )
                    }
                    value={option}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={classNames(
                            selected ? "font-semibold" : "font-normal",
                            "block truncate"
                          )}
                        >
                          {option.emoji} {option.name}
                        </span>

                        {selected ? (
                          <span
                            className={classNames(
                              active ? "text-white" : "text-brand-600",
                              "absolute inset-y-0 right-0 flex items-center pr-4"
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
}
