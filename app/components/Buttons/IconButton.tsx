import clsx from "clsx";

const buttonStyles = {
  primary: "bg-brand-700 text-white hover:bg-brand-800",
  secondary:
    "bg-brand-100 dark:bg-zinc-700 text-brand-700 dark:text-white hover:bg-brand-200 dark:hover:bg-zinc-600 ",
};
export default function Button({
  leftIcon,
  rightIcon,
  children,
  className,
  variant = "secondary",
  ...rest
}: React.PropsWithChildren<
  {
    leftIcon?: JSX.Element;
    rightIcon?: JSX.Element;
    variant?: "primary" | "secondary";
  } & React.HTMLAttributes<HTMLButtonElement> &  React.ButtonHTMLAttributes<HTMLButtonElement>
>) {
  return (
    <button
      type="button"
      className={clsx(
        "m-4 inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:ring-offset-zinc-900",
        buttonStyles[variant],
        className
      )}
      {...rest}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}
