import clsx from "clsx";
import LoadingSpinner from "../LoadingSpinner";

const buttonStyles = {
  primary: "bg-brand-700 text-white hover:bg-brand-600",
  secondary:
    "bg-brand-100 dark:bg-zinc-400 text-brand-700 hover:bg-brand-200 dark:hover:bg-zinc-300 ",
  danger:
    "bg-red-600 dark:bg-red-700 text-white hover:bg-red-500 dark:hover:bg-red-600",
};
export default function Button({
  leftIcon,
  rightIcon,
  children,
  className,
  variant = "secondary",
  isLoading = false,
  ...rest
}: React.PropsWithChildren<
  {
    leftIcon?: JSX.Element;
    rightIcon?: JSX.Element;
    variant?: "primary" | "secondary" | "danger";
    isLoading?: boolean;
  } & React.HTMLAttributes<HTMLButtonElement> &
    React.ButtonHTMLAttributes<HTMLButtonElement>
>) {
  return (
    <button
      type="button"
      className={clsx(
        "inline-flex items-center justify-center rounded-md disabled:opacity-30 disabled:pointer-events-none border border-transparent px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:ring-offset-zinc-900",
        buttonStyles[variant],
        className
      )}
      {...rest}
    >
      {isLoading && <LoadingSpinner />}
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}
