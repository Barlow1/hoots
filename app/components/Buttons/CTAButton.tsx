import { Link } from "@remix-run/react";
import React from "react";

function CTAButton({
  icon,
  children,
  href,
}: React.PropsWithChildren<{ icon: JSX.Element; href: string }>) {
  return (
    <Link
      type="button"
      to={href}
      className="mt-5 inline-flex items-center justify-center rounded-md border border-transparent bg-brand-700 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
    >
      {children}
      <span className="-ml-1 mr-3 h-5 w-5" aria-hidden="true">
        {icon}
      </span>
    </Link>
  );
}

export default CTAButton;
