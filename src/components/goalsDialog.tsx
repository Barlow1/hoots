import * as React from "react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  FormControl,
  FormLabel,
  Stack,
  Input,
  Textarea,
  Box,
} from "@chakra-ui/react";
import { Field, Formik } from "formik";
import { UserGoal } from "../pages/goals";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk, faXmark } from "@fortawesome/free-solid-svg-icons";

export interface GoalsDialogProps {
  userGoals: UserGoal[];
  setUserGoals: Function;
  isDialogOpen: boolean;
  setIsDialogOpen: Function;
  index?: number;
}

export const GoalsDialog = ({
  userGoals,
  setUserGoals,
  isDialogOpen,
  setIsDialogOpen,
  index,
}: GoalsDialogProps) => {
  const onClose = () => {
    setIsDialogOpen(false);
  };
  const cancelRef = React.useRef(null);
  let nameInput = index || index === 0 ? userGoals[index].name : "";
  let dateInput = index || index === 0 ? userGoals[index].dueDate : "";
  let notesInput =
    (index || index === 0) && userGoals[index].notes
      ? userGoals[index].notes
      : "";

  return (
    <AlertDialog
      isOpen={isDialogOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {index ? "Edit Goal" : "New Goal"}
          </AlertDialogHeader>

          <AlertDialogBody>
            <Formik
              initialValues={{ nameInput, dateInput, notesInput }}
              onSubmit={(values, actions) => {
                setTimeout(() => {
                  let newUserGoals: UserGoal[] = userGoals;
                  if (index) {
                    newUserGoals[index] = {
                      ...newUserGoals[index],
                      name: values.nameInput,
                      dueDate: values.dateInput,
                      notes: values.notesInput,
                    };
                  } else {
                    newUserGoals.push({
                      name: values.nameInput,
                      dueDate: values.dateInput,
                      notes: values.notesInput,
                      progress: 0,
                    });
                  }
                  setUserGoals();
                  actions.setSubmitting(false);
                }, 1000);
              }}
            >
              {(props) => (
                <Stack spacing={3}>
                  <Field name="nameInput">
                    {({ field }) => (
                      <FormControl>
                        <FormLabel>Name</FormLabel>
                        <Input {...field} placeholder={"Enter new goal"} />
                      </FormControl>
                    )}
                  </Field>
                  <Field name="dateInput">
                    {({ field }) => (
                      <FormControl>
                        <FormLabel>Due</FormLabel>
                        <Input {...field} placeholder={"Enter due date"} />
                      </FormControl>
                    )}
                  </Field>
                  <Field name="notesInput">
                    {({ field }) => (
                      <FormControl>
                        <FormLabel>Notes</FormLabel>
                        <Textarea
                          {...field}
                          placeholder={"Enter notes for your goal"}
                        />
                      </FormControl>
                    )}
                  </Field>
                  <Box style={{ width: "100%", textAlign: "right" }}>
                    <Button
                      colorScheme="gray"
                      ref={cancelRef}
                      onClick={onClose}
                      style={{ marginRight: "2rem" }}
                    >
                      Cancel
                      <FontAwesomeIcon
                        style={{ marginLeft: "1rem" }}
                        icon={faXmark}
                      />
                    </Button>
                    <Button type="submit" colorScheme="blue" onClick={onClose}>
                      Save
                      <FontAwesomeIcon
                        style={{ marginLeft: "1rem" }}
                        icon={faFloppyDisk}
                      />
                    </Button>
                  </Box>
                </Stack>
              )}
            </Formik>
          </AlertDialogBody>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
