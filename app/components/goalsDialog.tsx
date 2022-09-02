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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useUser } from "~/utils/useRootData";
import { Goal } from "@prisma/client";
import { Form, useFetcher } from "@remix-run/react";

export interface GoalsDialogProps {
  userGoals: Goal[];
  isDialogOpen: boolean;
  setIsDialogOpen: Function;
  id: string;
}

export const GoalsDialog = ({
  userGoals,
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
  const milestoneFetcher = useFetcher();

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
            <milestoneFetcher.Form method="post">
              <input hidden name="goalId" value={goal?.id}></input>
              <Stack spacing={3}>
                <FormControl>
                  <FormLabel>Name</FormLabel>
                  <Input
                    name="nameInput"
                    placeholder={"Enter new goal"}
                    defaultValue={nameInput}
                  />
                </FormControl>
                <FormLabel>Due</FormLabel>
                <Input
                  name="dateInput"
                  placeholder="Enter Due Date"
                  type="date"
                  defaultValue={dateInput}
                />
                <FormLabel>Notes</FormLabel>
                <Textarea
                  name="notesInput"
                  placeholder={"Enter notes for your goal"}
                  defaultValue={notesInput}
                />
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
            </milestoneFetcher.Form>
          </AlertDialogBody>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
