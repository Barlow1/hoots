import { useCheckbox, UseCheckboxProps } from "@chakra-ui/checkbox";
import {
  Box,
  Flex,
  useColorModeValue,
  Text,
  FormLabel,
} from "@chakra-ui/react";
import { faCheckCircle, faCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface LargeCheckBoxProps {
  label: string;
  icon?: React.ReactNode;
}

const LargeCheckBox = (props: UseCheckboxProps & LargeCheckBoxProps) => {
  const { state, getCheckboxProps, getInputProps, getLabelProps, htmlProps } =
    useCheckbox(props);
  return (
    <FormLabel
      rounded={"lg"}
      bg={useColorModeValue("white", "gray.700")}
      boxShadow={"lg"}
      p={2}
      maxW={{ base: "full", md: "md" }}
      borderWidth="1px"
      borderRadius="lg"
      _hover={{ backgroundColor: "gray.100" }}
      cursor="pointer"
      display="flex"
      flexDirection={"column"}
      h="100%"
      justifyContent="space-between"
      {...htmlProps}
    >
      <Flex justifyContent={"center"} p="2">
        {props.icon}
      </Flex>
      <input
        {...getInputProps()}
        name={props.name}
        checked={state.isChecked}
        hidden
      />
      <Flex>
        <Text size="sm" fontWeight={"bold"}>
          {props.label}
        </Text>
      </Flex>
      <Flex {...getCheckboxProps()} justifyContent="end">
        {state.isChecked ? (
          <FontAwesomeIcon icon={faCheckCircle} color="#0EAD69" />
        ) : (
          <FontAwesomeIcon icon={faCircle} color="#e2e8f0" />
        )}
      </Flex>
    </FormLabel>
  );
};

export default LargeCheckBox;
