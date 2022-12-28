import type { ReactNode } from "react";
import { Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  BellIcon,
  MoonIcon,
  SunIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { Link, useFetcher, useLocation } from "@remix-run/react";
// eslint-disable-next-line import/no-cycle
import { useMentorProfile, useUser } from "~/utils/useRootData";
import { useTheme } from "hooks/useTheme";
import { routes } from "../routes";
import Logo from "../assets/Logo.svg";
import { H3 } from "./Typography";
import { Theme } from "./ThemeProvider";
import Avatar from "./Avatar";

export default function SidebarWithHeader({
  children,
}: {
  children: ReactNode;
}) {
  const navigation = [
    { name: "Dashboard", href: routes.home },
    { name: "Browse", href: routes.browse },
    { name: "Goals", href: routes.goals },
    { name: "Applications", href: routes.applications, hidden: true },
  ];

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
  }

  const location = useLocation();

  const user = useUser();
  const mentorProfile = useMentorProfile();
  const signOutFetcher = useFetcher();

  const [theme, setTheme] = useTheme();
  const toggleTheme = () => {
    if (theme === Theme.DARK) {
      setTheme(Theme.LIGHT);
    } else {
      setTheme(Theme.DARK);
    }
  };
  const userNavigation = [
    {
      name: "About Me",
      href: routes.startAbout,
    },
    {
      name: mentorProfile ? "Edit Mentor Profile" : "Create Mentor Profile",
      href: routes.newMentorProfile,
    },
  ];

  const defaultNavigation = [
    { name: "Sign In", href: routes.login },
    { name: "Create Account", href: routes.signup },
  ];

  const locationSplit = location.pathname.split("/");
  const rootPath = `/${locationSplit[1]}`;
  const routeTitle = navigation.find((route) => route.href === rootPath)?.name;

  return (
    <div className="bg-white dark:bg-zinc-900">
      <>
        <div className="min-h-full">
          <Disclosure as="nav" className="bg-white dark:bg-zinc-800 shadow-sm">
            {({ open }) => (
              <>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="flex h-16 justify-between">
                    <div className="flex">
                      <div className="flex flex-shrink-0 items-center">
                        <img
                          className="block h-8 w-auto lg:hidden"
                          src={Logo}
                          alt="Hoots"
                        />
                        <img
                          className="hidden h-8 w-auto lg:block"
                          src={Logo}
                          alt="Hoots"
                        />
                      </div>
                      <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                        {navigation
                          .filter((item) => !item.hidden)
                          .map((item) => {
                            const current = rootPath === item.href;
                            return (
                              <Link
                                key={item.name}
                                to={item.href}
                                className={classNames(
                                  current
                                    ? "border-brand-500 text-gray-900 dark:text-white"
                                    : "border-transparent text-gray-500 dark:text-gray-300  dark:hover:text-white hover:text-gray-700 hover:border-gray-300",
                                  "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                )}
                                aria-current={current ? "page" : undefined}
                              >
                                {item.name}
                              </Link>
                            );
                          })}
                      </div>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
                      <button
                        type="button"
                        onClick={() => {
                          toggleTheme();
                        }}
                        className="rounded-full bg-white dark:bg-zinc-800 p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                      >
                        <span className="sr-only">Toggle Dark</span>
                        {theme === "dark" ? (
                          <SunIcon className="h-6 w-6" aria-hidden="true" />
                        ) : (
                          <MoonIcon className="h-6 w-6" aria-hidden="true" />
                        )}
                      </button>
                      <button
                        type="button"
                        className="rounded-full bg-white dark:bg-zinc-800 p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                      >
                        <span className="sr-only">View notifications</span>
                        <BellIcon className="h-6 w-6" aria-hidden="true" />
                      </button>

                      {/* Profile dropdown */}
                      <Menu as="div" className="relative ml-3">
                        <div>
                          <Menu.Button className="flex rounded-full bg-white dark:bg-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2">
                            <span className="sr-only">Open user menu</span>
                            <Avatar
                              size="xs"
                              src={user?.img ?? undefined}
                              alt="Profile Image"
                            />
                          </Menu.Button>
                        </div>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-200"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-zinc-700 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            {userNavigation.map((item) => (
                              <Menu.Item key={item.name}>
                                {({ active }) => (
                                  <Link
                                    to={item.href ?? ""}
                                    className={classNames(
                                      active
                                        ? "text-gray-900 bg-brand-100 dark:text-white dark:bg-zinc-500"
                                        : "text-gray-900 dark:text-white",
                                      "cursor-pointer select-none p-4 text-sm hover:underline group flex w-full items-center rounded-md px-2 py-2"
                                    )}
                                  >
                                    {item.name}
                                  </Link>
                                )}
                              </Menu.Item>
                            ))}
                            {user ? (
                              <>
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      type="button"
                                      className={classNames(
                                        active
                                          ? "text-gray-900 bg-brand-100 dark:text-white dark:bg-zinc-500"
                                          : "text-gray-900 dark:text-white",
                                        "cursor-pointer select-none p-4 text-sm hover:underline group flex w-full items-center rounded-md px-2 py-2"
                                      )}
                                      onClick={() =>
                                        signOutFetcher.submit(
                                          {},
                                          {
                                            action: "actions/logout",
                                            method: "post",
                                          }
                                        )
                                      }
                                    >
                                      Sign out
                                    </button>
                                  )}
                                </Menu.Item>
                              </>
                            ) : (
                              defaultNavigation.map((item) => (
                                <Menu.Item key={item.name}>
                                  {({ active }) => (
                                    <Link
                                      to={item.href ?? ""}
                                      className={classNames(
                                        active
                                          ? "text-gray-900 bg-brand-100 dark:text-white dark:bg-zinc-500"
                                          : "text-gray-900 dark:text-white",
                                        "cursor-pointer select-none p-4 text-sm hover:underline group flex w-full items-center rounded-md px-2 py-2"
                                      )}
                                    >
                                      {item.name}
                                    </Link>
                                  )}
                                </Menu.Item>
                              ))
                            )}
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </div>
                    <div className="-mr-2 flex items-center sm:hidden">
                      {/* Mobile menu button */}
                      <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-white dark:bg-zinc-800 p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2">
                        <span className="sr-only">Open main menu</span>
                        {open ? (
                          <XMarkIcon
                            className="block h-6 w-6"
                            aria-hidden="true"
                          />
                        ) : (
                          <Bars3Icon
                            className="block h-6 w-6"
                            aria-hidden="true"
                          />
                        )}
                      </Disclosure.Button>
                    </div>
                  </div>
                </div>

                <Disclosure.Panel className="sm:hidden">
                  <div className="space-y-1 pt-2 pb-3">
                    {navigation
                      .filter((item) => !item.hidden)
                      .map((item) => {
                        const current = rootPath === item.href;
                        return (
                          <Disclosure.Button
                            key={item.name}
                            as={Link}
                            to={item.href}
                            className={classNames(
                              current
                                ? "bg-brand-50 border-brand-500 text-brand-700"
                                : "text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-zinc-700 dark:hover:text-white",
                              "block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                            )}
                            aria-current={current ? "page" : undefined}
                          >
                            {item.name}
                          </Disclosure.Button>
                        );
                      })}
                  </div>
                  <div className="border-t border-gray-200 dark:border-zinc-800 pt-4 pb-3">
                    <div className="flex items-center px-4">
                      <div className="flex-shrink-0">
                        <Avatar
                          size="sm"
                          src={user?.img ?? undefined}
                          alt="Profile Image"
                        />
                      </div>
                      <div className="ml-3">
                        <div className="text-base font-medium text-gray-800 dark:text-white">
                          {user?.firstName} {user?.lastName}
                        </div>
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-200">
                          {user?.email}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          toggleTheme();
                        }}
                        className="ml-auto rounded-full bg-white dark:bg-zinc-800 p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                      >
                        <span className="sr-only">View notifications</span>
                        {theme === "dark" ? (
                          <SunIcon className="h-6 w-6" aria-hidden="true" />
                        ) : (
                          <MoonIcon className="h-6 w-6" aria-hidden="true" />
                        )}
                      </button>
                      <button
                        type="button"
                        className="ml-2 flex-shrink-0 rounded-full bg-white dark:bg-zinc-800 p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                      >
                        <span className="sr-only">View notifications</span>
                        <BellIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="mt-3 space-y-1">
                      {userNavigation.map((item) => (
                        <Disclosure.Button
                          key={item.name}
                          as={Link}
                          to={item.href}
                          className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-zinc-700 dark:hover:text-white"
                        >
                          {item.name}
                        </Disclosure.Button>
                      ))}
                      {user ? (
                        <>
                          <Disclosure.Button
                            as={Link}
                            to={routes.login}
                            onClick={() =>
                              signOutFetcher.submit(
                                {},
                                {
                                  action: "actions/logout",
                                  method: "post",
                                }
                              )
                            }
                            className="block px-4 py-2 text-base font-medium text-gray-500  hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-700 dark:hover:text-white hover:text-gray-800"
                          >
                            Sign Out
                          </Disclosure.Button>
                        </>
                      ) : (
                        defaultNavigation.map((item) => (
                          <Disclosure.Button
                            key={item.name}
                            as={Link}
                            to={item.href}
                            className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-zinc-700 dark:hover:text-white"
                          >
                            {item.name}
                          </Disclosure.Button>
                        ))
                      )}
                    </div>
                  </div>
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>

          <div className="py-10">
            <header>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <H3 as="h1" className="font-bold">
                  {routeTitle ?? "Dashboard"}
                </H3>
              </div>
            </header>
            <main>
              <div className="px-4 py-8 sm:px-0">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>
      </>
    </div>
  );
}
