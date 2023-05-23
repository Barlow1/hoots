import { Link } from "@remix-run/react";
import clsx from "clsx";
import React from "react";

const variants = {
  primarySmall: "px-4 py-2 h-10",
  primary: "px-6 py-3 mt-5",
};

function CTAButton({
  icon,
  children,
  href,
  variant = "primary",
}: React.PropsWithChildren<{
  icon: JSX.Element;
  href: string;
  variant?: "primary" | "primarySmall";
}>) {
  return (
    <Link
      type="button"
      to={href}
      className={clsx(
        "inline-flex items-center justify-center rounded-md border border-transparent bg-brand-700 text-base font-medium text-white shadow-sm hover:bg-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:ring-offset-zinc-900",
        variants[variant]
      )}
    >
      {children}
      <span className="-ml-1 mr-3 h-5 w-5" aria-hidden="true">
        {icon}
      </span>
    </Link>
  );
}

export default CTAButton;
