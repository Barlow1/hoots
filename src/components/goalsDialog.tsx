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
import { Field, Form, Formik } from "formik";
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
                  console.log(index);
                  console.log(values);
                  let newUserGoals: UserGoal[] = [...userGoals];
                  if (index || index === 0) {
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
                  setUserGoals(newUserGoals);
                  actions.setSubmitting(false);
                  onClose();
                }, 1000);
              }}
            >
              {(props) => (
                <Stack spacing={3}>
                  <Form>
                    <Field name="nameInput">
                      {({ field }: { [key: string]: any }) => (
                        <FormControl>
                          <FormLabel>Name</FormLabel>
                          <Input {...field} placeholder={"Enter new goal"} />
                        </FormControl>
                      )}
                    </Field>
                    <Field name="dateInput">
                      {({ field }: { [key: string]: any }) => (
                        <FormControl>
                          <FormLabel>Due</FormLabel>
                          <Input {...field} placeholder={"Enter due date"} />
                        </FormControl>
                      )}
                    </Field>
                    <Field name="notesInput">
                      {({ field }: { [key: string]: any }) => (
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
                      <Button
                        type="submit"
                        colorScheme="blue"
                        isLoading={props.isSubmitting}
                      >
                        Save
                        <FontAwesomeIcon
                          style={{ marginLeft: "1rem" }}
                          icon={faFloppyDisk}
                        />
                      </Button>
                    </Box>
                  </Form>
                </Stack>
              )}
            </Formik>
          </AlertDialogBody>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
