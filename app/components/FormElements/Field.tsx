import React from "react";
import { Paragraph } from "../Typography";
import InputError from "./InputError";

export interface FieldProps {
  name: string;
  type: "textarea" | "input" | "date" | "email" | "password" | "number";
  label: string;
  error?: string | null;
  isDisabled?: boolean;
  subLabel?: string;
  isRequired?: boolean;
  placeholder?: string;
  defaultValue?: string | number | string[];
  inputRightElement?: React.ReactNode;
  min?: string | number;
  max?: string | number;
}

const Field = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement | HTMLDataElement | null,
  FieldProps
>(
  (
    {
      name,
      type,
      error,
      label,
      subLabel: sublabel,
      isDisabled: disabled,
      isRequired,
      placeholder,
      defaultValue,
      inputRightElement,
      min,
      max,
    },
    ref
  ) => {
    const errorId = `${name}-error`;
    const getInputByType = (inputType: string) => {
      switch (inputType) {
        case "textarea":
          return (
            <textarea
              className="block w-full rounded-md border border-gray-300 dark:text-white dark:border-gray-300/20 shadow-sm outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 bg-transparent dark:ring-offset-zinc-900 sm:text-sm px-4 py-2 leading-normal"
              rows={3}
              disabled={disabled}
              name={name}
              required={isRequired}
              placeholder={placeholder}
              defaultValue={defaultValue}
              ref={ref as React.MutableRefObject<HTMLTextAreaElement>}
            />
          );
          break;
        case "number":
          return (
            <input
              className="block bg-transparent w-full rounded-md dark:text-white h-8 border-gray-300 dark:border-gray-300/10 pl-2 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:ring-offset-zinc-900 sm:text-sm"
              disabled={disabled}
              name={name}
              type={inputType}
              required={isRequired}
              placeholder={placeholder}
              defaultValue={defaultValue}
              min={min}
              max={max}
              ref={ref as React.MutableRefObject<HTMLInputElement>}
            />
          );
          break;
        case "date":
        default:
          return (
            <div className="relative">
              <input
                className="block w-full border rounded-md border-gray-300 dark:text-white dark:border-gray-300/20 shadow-sm outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 bg-transparent dark:ring-offset-zinc-900 sm:text-sm px-4 py-2 leading-normal"
                disabled={disabled}
                name={name}
                type={inputType}
                required={isRequired}
                placeholder={placeholder}
                defaultValue={defaultValue}
                ref={ref as React.MutableRefObject<HTMLInputElement>}
              />
              {inputRightElement ? (
                <div className="absolute flex right-0 top-0 items-center content-center h-full w-10">
                  {inputRightElement}
                </div>
              ) : null}
            </div>
          );
      }
    };
    const input = getInputByType(type);
    return (
      <>
        <label
          className="block text-md font-medium text-gray-700 dark:text-gray-200"
          htmlFor={name}
        >
          {label}
          {isRequired && <span className="text-red-400 ml-px">*</span>}
        </label>
        {sublabel && (
          <Paragraph className="block text-xs text-gray-700 dark:text-gray-200">
            {sublabel}
          </Paragraph>
        )}
        {error ? <InputError id={errorId}>{error}</InputError> : null}
        {input}
      </>
    );
  }
);

export default Field;
