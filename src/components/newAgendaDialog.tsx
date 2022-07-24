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
// import { UserGoal } from "../pages/goals";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk, faXmark } from "@fortawesome/free-solid-svg-icons";
export interface NewAgendaItem {
  name: string;
  notes?: string;
}
export interface NewAgendaDialog {
  userAgendaItem: NewAgendaItem[];
  setAgendaItem: Function;
  isDialogOpen: boolean;
  setIsDialogOpen: Function;
  index?: number;
}

export const NewAgendaDialog = ({
  userAgendaItem,
  setAgendaItem,
  isDialogOpen,
  setIsDialogOpen,
  index,
}: NewAgendaDialog) => {
  console.log(`userAgenda: ${JSON.stringify(userAgendaItem)}`);
  const onClose = () => {
    setIsDialogOpen(false);
  };
  const cancelRef = React.useRef(null);
  let nameInput = index || index === 0 ? userAgendaItem[index].name : "";
  // let dateInput = index || index === 0 ? userGoals[index].dueDate : "";
  let notesInput =
    (index || index === 0) && userAgendaItem[index].notes
      ? userAgendaItem[index].notes
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
            {"New Agenda Item"}
          </AlertDialogHeader>

          <AlertDialogBody>
            <Formik
              initialValues={{ nameInput, notesInput }}
              onSubmit={(values, actions) => {
                setTimeout(() => {
                  let newUserGoals: NewAgendaItem[] = userAgendaItem;
                  if (index) {
                    newUserGoals[index] = {
                      ...newUserGoals[index],
                      name: values.nameInput,
                      notes: values.notesInput,
                    };
                  } else {
                    newUserGoals.push({
                      name: values.nameInput,
                      notes: values.notesInput,
                    });
                  }
                  console.log(`justBefore ${JSON.stringify(newUserGoals)}`)
                  setAgendaItem(newUserGoals);
                  actions.setSubmitting(false);
                  onClose();
                }, 1000);
              }}
            >
              {(props) => (
        <Form style={{padding: 5}}>

                <Stack spacing={3}>
                  <Field name="nameInput">
                    {({ field }:{[key:string]:any}) => (
                      <FormControl>
                        <FormLabel>Name</FormLabel>
                        <Input {...field} placeholder={"Enter name of new agenda item"} />
                      </FormControl>
                    )}
                  </Field>
                  <Field name="notesInput">
                    {({ field }:{[key:string]:any}) => (
                      <FormControl>
                        <FormLabel>Notes</FormLabel>
                        <Textarea
                          {...field}
                          placeholder={"Enter notes for your agenda item"}
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
                    <Button type="submit" colorScheme="blue"
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
