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
import { Goal } from "@prisma/client";
import { useUser } from "./UserContext";

export interface GoalsDialogProps {
  userGoals: UserGoal[];
  setUserGoals: Function;
  isDialogOpen: boolean;
  setIsDialogOpen: Function;
  index?: number;
}

const putGoal = async ({ goal }: { goal: Partial<Goal> }) => {
  const baseUrl = import.meta.env.VITE_API_URL;
  const response = await fetch(`${baseUrl}/.netlify/functions/put-goal`, {
    method: "PUT",
    body: JSON.stringify(goal),
  })
    .then((goals) => goals.json())
    .catch(() => {
      alert("Failed to put goal, please try again in a few minutes.");
    });

  return response;
};

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

      const {user} = useUser();

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
              onSubmit={async (values, actions) => {
                console.log(index);
                console.log(values);
                let newUserGoals: UserGoal[] = [...userGoals];
                const goal = await putGoal({
                  goal: {
                    name: values.nameInput ?? null,
                    dueDate: values.dateInput ?? null,
                    notes: values.notesInput ?? null,
                    progress: 0,
                    userId: user.id
                  },
                });
                newUserGoals.push(goal);
                setUserGoals(newUserGoals);
                actions.setSubmitting(false);
                onClose();
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
