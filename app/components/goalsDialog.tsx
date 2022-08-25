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
import { Field, FieldAttributes, Form, Formik } from "formik";
import { UserGoal } from "../routes/goals";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useUser } from "~/utils/useRootData";

export interface GoalsDialogProps {
  userGoals: UserGoal[];
  setUserGoals: Function;
  isDialogOpen: boolean;
  setIsDialogOpen: Function;
  id: string;
}

export const GoalsDialog = ({
  userGoals,
  setUserGoals,
  isDialogOpen,
  setIsDialogOpen,
  id,
}: GoalsDialogProps) => {
  const onClose = () => {
    setIsDialogOpen(false);
  };
  const cancelRef = React.useRef(null);
  const goal = userGoals.find((userGoal) => userGoal.id === id);
  let nameInput = goal?.name;
  let dateInput = goal?.dueDate;
  let notesInput = goal?.notes;
  const user = useUser();

  const onSubmit = React.useCallback(async (values: any, actions: any) => {
    const baseUrl = window.env.DEPLOY_URL;
    const response = await fetch(
      `${baseUrl}/.netlify/functions/put-goal?userId=${user?.id}${
        goal?.id ? `&id=${goal.id}` : ""
      }`,
      {
        method: "PUT",
        body: JSON.stringify({
          name: values.nameInput,
          dueDate: values.dateInput,
          notes: values.notesInput,
          progress: 0,
        }),
      }
    )
      .then((user) => user.json())
      .catch(() => {
        console.error("Failed to add goal, please try again in a few minutes.");
      });
    if (response.error) {
      console.error(response.error);
    } else if (response.goal) {
      const goalsCopy = [...userGoals];
      let indx = goalsCopy.findIndex((userGoal) => userGoal.id === id);
      if (indx !== -1) {
        goalsCopy[indx] = response.goal;
      } else {
        goalsCopy.push(response.goal);
      }
      setUserGoals(goalsCopy);
    }
    onClose();
  }, []);

  return (
    <AlertDialog
      isOpen={isDialogOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {id ? "Edit Goal" : "New Goal"}
          </AlertDialogHeader>

          <AlertDialogBody>
            <Formik
              initialValues={{ nameInput, dateInput, notesInput }}
              onSubmit={onSubmit}
            >
              {(props) => (
                <Form>
                  <Stack spacing={3}>
                    <Field name="nameInput">
                      {({ field }: FieldAttributes<any>) => (
                        <FormControl>
                          <FormLabel>Name</FormLabel>
                          <Input {...field} placeholder={"Enter new goal"} />
                        </FormControl>
                      )}
                    </Field>
                    <Field name="dateInput">
                      {({ field }: FieldAttributes<any>) => (
                        <FormControl>
                          <FormLabel>Due</FormLabel>
                          <Input {...field} placeholder={"Enter due date"} />
                        </FormControl>
                      )}
                    </Field>
                    <Field name="notesInput">
                      {({ field }: FieldAttributes<any>) => (
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
                  </Stack>
                </Form>
              )}
            </Formik>
          </AlertDialogBody>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
