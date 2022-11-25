import React from "react";

function Tag({ children }: React.PropsWithChildren<{}>) {
  return (
    <span className="inline-flex items-center rounded-full bg-brand-100 dark:bg-slate-700 px-2.5 py-0.5 text-xs font-medium text-brand-800 dark:text-white mr-1 mb-1">
      {children}
    </span>
  );
}

export default Tag;
