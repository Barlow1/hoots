import { Paragraph } from "../Typography";
import InputError from "./InputError";

export interface FieldProps {
  name: string;
  type: "textarea" | "input";
  label: string;
  error?: string | null;
  isDisabled?: boolean;
  subLabel?: string;
  isRequired?: boolean;
}

export default function Field({
  name,
  type,
  error,
  label,
  subLabel: sublabel,
  isDisabled: disabled,
  isRequired,
}: FieldProps) {
  const errorId = `${name}-error`;
  const getInputByType = (inputType: string) => {
    switch (inputType) {
      case "textarea":
        return (
          <textarea
            className="block w-full rounded-md border border-gray-300 dark:border-gray-300/20 shadow-sm outline-none focus:ring-2 focus:ring-brand-500 dark:bg-zinc-900 focus:ring-offset-2 dark:ring-offset-zinc-900 sm:text-sm px-4 py-2 leading-normal"
            rows={3}
            disabled={disabled}
            name={name}
            required={isRequired}
          />
        );
        break;
      default:
        return (
          <input
            className="block w-full border rounded-md border-gray-300 dark:border-gray-300/20 shadow-sm outline-none focus:ring-2 focus:ring-brand-500 dark:bg-zinc-900 focus:ring-offset-2 dark:ring-offset-zinc-900 sm:text-sm px-4 py-2 leading-normal"
            disabled={disabled}
            name={name}
            type={inputType}
            required={isRequired}
          />
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
