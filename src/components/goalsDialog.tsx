// import * as React from "react";
// import {
//   AlertDialog,
//   AlertDialogBody,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogContent,
//   AlertDialogOverlay,
//   useDisclosure,
//   Button,
//   FormControl,
//   FormLabel,
//   FormErrorMessage,
//   Stack,
//   Input,
//   Textarea,
// } from "@chakra-ui/react";
// import { Field, Form, Formik } from "formik";
// import { UserGoal } from "../pages/goals";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faFloppyDisk, faXmark } from "@fortawesome/free-solid-svg-icons";

// export const GoalsDialog = (goal?: UserGoal, setGoal: Function) => {
//   const { isOpen, onOpen, onClose } = useDisclosure();
//   const cancelRef = React.useRef(null);
//   let nameInput = goal ? goal.name : ""
//   let dateInput = goal ? goal.dueDate : ""
//   let notesInput = goal && goal.notes ? goal.notes : ""

//   return (
//     <AlertDialog
//       isOpen={isOpen}
//       leastDestructiveRef={cancelRef}
//       onClose={onClose}
//     >
//       <AlertDialogOverlay>
//         <AlertDialogContent>
//           <AlertDialogHeader fontSize="lg" fontWeight="bold">
//             {goal ? "Edit Goal" : "New Goal"}
//           </AlertDialogHeader>

//           <AlertDialogBody></AlertDialogBody>
//           <AlertDialogFooter>
//             <Button colorScheme="gray" ref={cancelRef} onClick={onClose}>
//               Cancel
//               <FontAwesomeIcon icon={faXmark} />
//             </Button>
//             <Button colorScheme="blue" onClick={onClose} ml={3}>
//               Save
//               <FontAwesomeIcon icon={faFloppyDisk} />
//             </Button>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialogOverlay>
//     </AlertDialog>
//   );
// };

// export const GoalForm = (nameInput:string, dateInput:string, notesInput:string, setGoal: Function) => {
//   const isNameError = !!nameInput;
//   const isDateError = !!dateInput;
//   return (
//     <Formik
//       initialValues={{ nameInput, dateInput, notesInput }}
//       onSubmit={(values, actions) => {
//         setTimeout(() => {
//             setGoal({
//                 name: values.nameInput,
//                 dueDate: values.dateInput,
//                 notes: values.notesInput,
//             })
//           actions.setSubmitting(false);
//         }, 1000);
//       }}
//     >
//       {(props) => (
//         <Stack spacing={3}>
//           <Field name="nameInput">
//             {({ field }) => (
//               <FormControl isRequired isInvalid={isNameError}>
//                 <FormLabel>Name</FormLabel>
//                 <Input
//                   {...field}
//                   placeholder={goal ? goal.name : "Enter new goal"}
//                 />
//                 {isNameError && (
//                   <FormErrorMessage>Name is required.</FormErrorMessage>
//                 )}
//               </FormControl>
//             )}
//           </Field>
//           <Field name="dateInput">
//             {({ field }) => (
//               <FormControl isRequired isInvalid={isDateError}>
//                 <FormLabel>Due</FormLabel>
//                 <Input
//                   {...field}
//                   placeholder={goal ? goal.dueDate : "Enter due date"}
//                 />
//                 {isDateError && (
//                   <FormErrorMessage>Due date is required.</FormErrorMessage>
//                 )}
//               </FormControl>
//             )}
//           </Field>
//           <Field name="notesInput">
//             {({ field }) => (
//               <FormControl>
//                 <FormLabel>Notes</FormLabel>
//                 <Textarea
//                   {...field}
//                   placeholder={
//                     goal ? goal.notes : "Enter any notes for your goal"
//                   }
//                 />
//               </FormControl>
//             )}
//           </Field>
//         </Stack>
//       )}
//     </Formik>
//   );
// };
