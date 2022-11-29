import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import IconButton from './IconButton';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function MenuButton({
  options,
  icon,
}: React.PropsWithChildren<{
  options: { title: string; href?: string; icon?: JSX.Element }[];
  icon: JSX.Element;
  buttonProps?: React.DOMAttributes<HTMLButtonElement>;
}>) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      {({ open }) => (
        <>
          <Menu.Button as={IconButton} icon={icon}>
            <span className="sr-only">Share</span>
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
            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 dark:divide-gray-800 rounded-md bg-white dark:bg-slate-700 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {options.map((option) => (option.href ? (
                <Menu.Item key={option.title}>
                  {({ active }) => (
                    <a
                      href={option.href}
                      className={classNames(
                        active
                          ? 'text-gray-900 bg-brand-100 dark:text-white dark:bg-slate-600'
                          : 'text-gray-900 dark:text-white',
                        'cursor-pointer select-none p-4 text-sm hover:underline group flex w-full items-center rounded-md px-2 py-2',
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span className="p-2">{option.icon}</span>
                      {option.title}
                    </a>
                  )}
                </Menu.Item>
              ) : (
                <Menu.Item key={option.title}>
                  {({ active }) => (
                    <span
                      className={classNames(
                        active
                          ? 'text-gray-900 bg-gray-400 dark:text-white dark:bg-slate-900'
                          : 'text-gray-900 dark:text-white',
                        'cursor-pointer select-none p-4 text-sm hover:underline group flex w-full items-center rounded-md px-2 py-2',
                      )}
                    >
                      <span className="p-2">{option.icon}</span>
                      {option.title}
                    </span>
                  )}
                </Menu.Item>
              )))}
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
}
