import clsx from "clsx";

const buttonStyles = {
  primary: "bg-brand-700 text-white hover:bg-brand-800",
  secondary:
    "bg-brand-100 dark:bg-slate-700 text-brand-700 dark:text-white hover:bg-brand-200 dark:hover:bg-slate-600 ",
};
export default function IconButton({
  icon,
  children,
  className,
  variant = "secondary",
  ...rest
}: React.PropsWithChildren<
  {
    icon: JSX.Element;
    variant?: "primary" | "secondary";
  } & React.HTMLAttributes<HTMLButtonElement>
>) {
  return (
    <>
      <button
        type="button"
        className={clsx(
          "inline-flex items-center rounded-md border border-transparent  px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2",
          buttonStyles[variant],
          className
        )}
        {...rest}
      >
        {icon}
        {children}
      </button>
    </>
  );
}
