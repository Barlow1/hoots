
export default function IconButton({
  icon,
  children,
  ...rest
}: React.PropsWithChildren<{
  icon: JSX.Element;
} & React.DOMAttributes<HTMLButtonElement>>) {
  return (
    <>
      <button
        type="button"
        className="inline-flex items-center rounded-md border border-transparent bg-brand-100 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-brand-700 dark:text-white hover:bg-brand-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        {...rest}
      >
        {icon}
        {children}
      </button>
    </>
  );
}
