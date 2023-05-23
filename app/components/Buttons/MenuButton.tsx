import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Link } from "@remix-run/react";
import Button from "./IconButton";
import { Paragraph } from "../Typography";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function MenuButton({
  options,
  noOptionsLabel,
  leftIcon,
  rightIcon,
  label,
  children,
  className,
  menuClassName,
  direction = "right",
}: React.PropsWithChildren<{
  options?: {
    title: string;
    href?: string | { to: string };
    icon?: JSX.Element;
  }[];
  leftIcon?: JSX.Element;
  rightIcon?: JSX.Element;
  buttonProps?: React.DOMAttributes<HTMLButtonElement>;
  noOptionsLabel?: string;
  className?: string;
  menuClassName?: string;
  label: string;
  direction?: "left" | "right";
}>) {
  return (
    <Menu
      as="div"
      className={`relative inline-block text-left ${menuClassName}`}
    >
      {({ open }) => (
        <>
          <Menu.Button
            as={Button}
            leftIcon={leftIcon}
            rightIcon={rightIcon}
            className={className}
          >
            <span className="sr-only">{label}</span>
            {children}
          </Menu.Button>

          <Transition
            show={open}
            as={Fragment}
            leave="transition ease-in duration-200"
            enter="transition ease-in duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Menu.Items
              className={`absolute ${direction}-0 -mt-2 w-56 origin-top-${direction} divide-y divide-gray-100 dark:divide-gray-800 rounded-md bg-white dark:bg-zinc-700 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}
            >
              {options?.length ? (
                options?.map((option) =>
                  option.href ? (
                    <Menu.Item key={option.title}>
                      {({ active }) => {
                        const link =
                          typeof option.href === "string" ? (
                            <a
                              href={option.href}
                              className={classNames(
                                active
                                  ? "text-gray-900 bg-brand-100 dark:text-white dark:bg-zinc-600"
                                  : "text-gray-900 dark:text-white",
                                "cursor-pointer select-none p-4 text-sm hover:underline group flex w-full items-center rounded-md px-2 py-2"
                              )}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <span className="p-2">{option.icon}</span>
                              {option.title}
                            </a>
                          ) : (
                            <Link
                              to={option.href?.to ?? ""}
                              className={classNames(
                                active
                                  ? "text-gray-900 bg-brand-100 dark:text-white dark:bg-zinc-600"
                                  : "text-gray-900 dark:text-white",
                                "cursor-pointer select-none p-4 text-sm hover:underline group flex w-full items-center rounded-md px-2 py-2"
                              )}
                            >
                              <span className="p-2">{option.icon}</span>
                              {option.title}
                            </Link>
                          );
                        return <>{link}</>;
                      }}
                    </Menu.Item>
                  ) : (
                    <Menu.Item key={option.title}>
                      {({ active }) => (
                        <span
                          className={classNames(
                            active
                              ? "text-gray-900 bg-gray-400 dark:text-white dark:bg-zinc-900"
                              : "text-gray-900 dark:text-white",
                            "cursor-pointer select-none p-4 text-sm hover:underline group flex w-full items-center rounded-md px-2 py-2"
                          )}
                        >
                          <span className="p-2">{option.icon}</span>
                          {option.title}
                        </span>
                      )}
                    </Menu.Item>
                  )
                )
              ) : (
                <Paragraph>{noOptionsLabel ?? "No options found"}</Paragraph>
              )}
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
}
