import * as React from "react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  Textarea,
} from "@chakra-ui/react";
import { UserGoal } from "../pages/goals";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk, faXmark } from "@fortawesome/free-solid-svg-icons";

export const GoalsDialog = (goal?: UserGoal) => {
  const [nameInput, setNameInput] = React.useState<string>(
    goal ? goal.name : ""
  );
  const [dateInput, setDateInput] = React.useState<string>(
    goal ? goal.dueDate : ""
  );
  const [notesInput, setNotesInput] = React.useState<string>(
    goal && goal.notes ? goal.notes : ""
  );
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef(null);
  const isNameError = !!nameInput;
  const isDateError = !!dateInput;

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {goal ? "Edit Goal" : "New Goal"}
          </AlertDialogHeader>

          <AlertDialogBody>
          <FormControl isRequired isInvalid={isNameError}>
            <FormLabel>Name</FormLabel>
            <Input placeholder={goal ? goal.name : "Enter new goal"} />
            {isNameError && (
              <FormErrorMessage>Name is required.</FormErrorMessage>
            )}
          </FormControl>
          <FormControl isRequired isInvalid={isDateError}>
            <FormLabel>Due</FormLabel>
            <Input placeholder={goal ? goal.dueDate : "Enter due date"} />
            {isDateError && (
              <FormErrorMessage>Due date is required.</FormErrorMessage>
            )}
          </FormControl>
          <FormControl>
            <FormLabel>Notes</FormLabel>
            <Textarea
              placeholder={goal ? goal.notes : "Enter any notes for your goal"}
            />
          </FormControl>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button colorScheme="gray" ref={cancelRef} onClick={onClose}>
              Cancel
              <FontAwesomeIcon icon={faXmark} />
            </Button>
            <Button colorScheme="blue" onClick={onClose} ml={3}>
              Save
              <FontAwesomeIcon icon={faFloppyDisk} />
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
