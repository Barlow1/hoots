import { faCheckCircle, faCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Switch } from "@headlessui/react";
import React from "react";
import { Paragraph } from "./Typography";

interface LargeCheckBoxProps {
  name: string;
  label: string;
  icon?: React.ReactNode;
  onChange?: (value: string) => void;
}

function LargeCheckBox(props: LargeCheckBoxProps) {
  const { icon, name, label, onChange } = props;
  const [state, setState] = React.useState({ isChecked: false });

  const toggleIsChecked = () => {
    setState((prevState) => ({ isChecked: !prevState.isChecked }));
  };

  const handleChange = () => {
    onChange?.(name);
    toggleIsChecked();
  };
  return (
    <>
      <Switch.Group>
        <Switch
          name={name}
          checked={state.isChecked}
          value={name}
          onChange={handleChange}
          className="rounded-lg bg-white dark:bg-gray-600  shadow-lg p-2  w-full border-1 hover:bg-gray-100 dark:hover:bg-gray-500 cursor-pointer flex flex-col h-full content-between space-y-4"
        >
          <div className="w-full content-center">{icon}</div>
          <div className="w-full text-center">
            <Paragraph className="text-sm font-bold">{label}</Paragraph>
          </div>
          <div className="w-full flex justify-end">
            {state.isChecked ? (
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="text-[#0EAD69]"
              />
            ) : (
              <FontAwesomeIcon
                icon={faCircle}
                className="text-[#e2e8f0] dark:text-gray-300"
              />
            )}
          </div>
        </Switch>
      </Switch.Group>
    </>
  );
}

export default LargeCheckBox;
