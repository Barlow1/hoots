import { CheckIcon, CloseIcon, EditIcon, PhoneIcon } from "@chakra-ui/icons";
import {
  Text,
  Box,
  Button,
  ButtonGroup,
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  IconButton,
  Input,
  Textarea,
  useEditableControls,
  Avatar,
  TableContainer,
  Table,
  Thead,
  Th,
  Tr,
  Tbody,
  Checkbox,
  Td,
  CheckboxGroup,
} from "@chakra-ui/react";
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Field, Form, Formik } from "formik";
import { useEffect, useRef, useState } from "react";
import {
  NewAgendaDialog,
  NewAgendaItem,
} from "../../components/newAgendaDialog";
import getRoomCode, { generateToken } from "../../utils/telnyx";

type Route = {
  data: { id: string };
  params: { id: string };
};

export const loader: LoaderFunction = async ({ params }) => {
  return json({ data: { id: params.id } });
};

const pad = "5";
const handleJoinButtonClick = async () => {
  const roomCode = await getRoomCode();
  const token = await generateToken(roomCode);
  console.log(roomCode);
  console.log(token);
  if (roomCode && token) {
    console.log("attempting to go");
    window.location.replace(
      `https://telnyx-meet-demo.vercel.app/rooms/${roomCode}?client_token=${token.token}&refresh_token=${token.refresh_token}`
    );
  }
};
export const RoomPage = () => {
  function EditableControls() {
    const {
      isEditing,
      getSubmitButtonProps,
      getCancelButtonProps,
      getEditButtonProps,
    } = useEditableControls();

    return isEditing ? (
      <ButtonGroup padding="2" size="sm">
        <IconButton
          aria-label="submit"
          bgColor="brand.500"
          color="white"
          icon={<CheckIcon />}
          {...getSubmitButtonProps()}
        />
        <IconButton
          aria-label="cancel"
          bgColor="brand.500"
          color="white"
          icon={<CloseIcon />}
          {...getCancelButtonProps()}
        />
      </ButtonGroup>
    ) : (
      <Flex padding="2">
        <IconButton
          aria-label="edit"
          bgColor="brand.500"
          color="white"
          size="sm"
          icon={<EditIcon />}
          {...getEditButtonProps()}
        />
      </Flex>
    );
  }
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const openDialog = () => {
    setIsDialogOpen(true);
  };
  const mockData = {
    _id: { $oid: "62dce871f321e7c3d582838a" },
    date: "August 1st, 2022",
    time: "5:30PM",
    name: "Emily Jones",
    occupation: "QA Engineer",
    cost: { $numberInt: "0" },
    tags: ["QA", "Design", "Fun"],
    experience: { $numberInt: "10" },
    bio: "QA Engineer at Netlix. I love learning new things and breaking software. Looking to mentor a college student.",
    company: "Netflix",
    img: "https://i.ibb.co/C8rVLjB/Adobe-Stock-447929817.jpg",
  };
  const mockUserData = {
    agendItemTitle: "Redux Reducers",
    notes: `I wanna be the very best
  Like no one ever was
  To catch them is my real test
  To train them is my cause
  I will travel across the land
  Searching far and wide
  Teach Pokémon to understand
  The power that's inside
  (Pokémon
  Gotta catch 'em all) It's you and me
  I know it's my destiny (Pokémon)
  Oh, you're my best friend
  In a world we must defend (Pokémon
  Gotta catch 'em all) A heart so true
  Our courage will pull us through
  You teach me and I'll teach you (Ooh, ooh)
  Pokémon! (Gotta catch 'em all)
  Gotta catch 'em all
  Yeah`,
    agendaItems: [
      { name: "Redux Reducers", notes: "this is a very long note" },
      { name: "State Management", notes: "this is a very short note" },
      { name: "File Structure", notes: "this is a very short note" },
    ],
  };
  const [agendaItemList, setAgendaItem] = useState<NewAgendaItem[]>(
    mockUserData.agendaItems
  );
  const previousInputValue = useRef<NewAgendaItem[]>(mockUserData.agendaItems);
  const [tableEntries, setTableEntries] = useState<NewAgendaItem[]>(
    mockUserData.agendaItems
  );

  // useEffect(() => {
  //   previousInputValue.current = agendaItemList;
  //   tableEntries = agendaItemList.map(row => {
  //     return (
  //       <Tr>
  //         <Checkbox /> {row.name}
  //       </Tr>)
  //   });
  //   console.log(`AGENDA HAS CHANGED TO: ${JSON.stringify(agendaItemList)}`);
  // }, [])
  console.log(`LENGTH: ${agendaItemList.length}`);
  console.log(mockData.experience);
  const { data } = useLoaderData<Route>();
  console.log(data);
  return (
    <Formik
      initialValues={{
        agendaItem: mockUserData.agendItemTitle,
        notes: mockUserData.notes,
      }}
      onSubmit={(values, actions) => {
        setTimeout(() => {
          console.error(JSON.stringify(values, null, 2));
          actions.setSubmitting(false);
        }, 1000);
      }}
    >
      {(props) => (
        <Form>
          <Grid templateColumns="repeat(2, 1fr)" gap={6}>
            <GridItem rowSpan={4}>
              <Box
                height="100%"
                border="1px"
                borderColor="gray.200"
                borderRadius="5"
                padding="5"
                position="relative"
              >
                {/* <Text>hello</Text> */}
                <Field name="agendaItem">
                  {({ field }: { [key: string]: any }) => (
                    <FormControl>
                      <Editable
                        fontSize="xl"
                        fontWeight="bold"
                        defaultValue={`${mockUserData.agendItemTitle}`}
                        alignItems="center"
                        display="flex"
                      >
                        <EditablePreview />
                        <Input {...field} as={EditableInput} />
                        <EditableControls />
                      </Editable>
                    </FormControl>
                  )}
                </Field>
                {/* </GridItem> */}
                {/* <GridItem> */}
                <Field name="notes">
                  {({ field }: { [key: string]: any }) => (
                    <FormControl>
                      <FormLabel>Notes</FormLabel>
                      <Textarea
                        size="sm"
                        {...field}
                        placeholder={`${mockUserData.notes}`}
                      />
                    </FormControl>
                  )}
                </Field>
                {/* <GridItem pt='2'> */}
                <Box p="5" m="35">
                  <Button
                    colorScheme="blue"
                    size="lg"
                    textColor="white"
                    isLoading={props.isSubmitting}
                    type="submit"
                    position="absolute"
                    bottom="0"
                    right="0"
                    m="35"
                  >
                    Submit
                    <FontAwesomeIcon
                      style={{ marginLeft: "1rem" }}
                      icon={faFloppyDisk}
                    />
                  </Button>
                </Box>
                {/* </GridItem> */}
              </Box>
            </GridItem>
            <GridItem>
              <Box padding="5">
                <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                  <GridItem>
                    <Text textColor="#9faec0" fontWeight="bold">
                      Mentor
                    </Text>
                    <Box pt="2" display="flex">
                      <Avatar
                        size={"sm"}
                        src={
                          "https://images.unsplash.com/photo-1619946794135-5bc917a27793?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9"
                        }
                      />
                      <Text
                        justifyContent="center"
                        alignItems="center"
                        display="flex"
                        pl="2"
                        fontSize="sm"
                      >
                        {mockData.name}
                      </Text>
                    </Box>
                  </GridItem>
                  <GridItem display="grid" align-items="center">
                    <Text textColor="#9faec0" fontWeight="bold">
                      Date
                    </Text>
                    <Text fontSize="sm">{mockData.date}</Text>
                  </GridItem>
                  <GridItem>
                    <Text textColor="#9faec0" fontWeight="bold">
                      Time
                    </Text>
                    <Text m="auto" fontSize="sm">
                      {mockData.time}
                    </Text>
                  </GridItem>
                </Grid>
              </Box>
            </GridItem>
            <GridItem justifyContent="end" display="inline-flex">
              <Button
                background="brand.500"
                textColor="white"
                size="lg"
                fontSize="x-large"
                onClick={() => openDialog()}
              >
                Add agenda Item +
              </Button>
            </GridItem>
            <GridItem>
              {/* <Box */}
              <TableContainer
                border="1px"
                padding="2"
                borderRadius="10"
                borderColor="#E2E8F0"
              >
                <Table variant="simple" padding="5">
                  <Thead>
                    <Tr>
                      <Th>Agenda</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {tableEntries.map((row) => {
                      return (
                        <CheckboxGroup defaultValue={["Redux Reducers"]}>
                          <Tr mt="5">
                            <Td alignItems="center" display="flex" pl="2">
                              <Checkbox value={`${row.name}`} padding="2" />{" "}
                              {row.name}
                            </Td>
                          </Tr>
                        </CheckboxGroup>
                      );
                    })}
                    {/* {tableEntries} */}
                    {/* <Tr>
              <Checkbox/> test
              </Tr> */}
                  </Tbody>
                </Table>
              </TableContainer>
            </GridItem>
            <GridItem justifyContent="end" display="inline-flex">
              <Box p={pad}>
                <ButtonGroup gap="2">
                  <Button
                    backgroundColor={"brand.200"}
                    color="white"
                    size="lg"
                    variant="solid"
                    onClick={handleJoinButtonClick}
                  >
                    <Text style={{ paddingRight: "10px" }}>Join</Text>
                    <PhoneIcon />
                  </Button>
                  <Button
                    backgroundColor={"buttons.fail"}
                    color="white"
                    size="lg"
                    variant="solid"
                  >
                    <Text style={{ paddingRight: "10px" }}>Reject</Text>
                    <CloseIcon />
                  </Button>
                </ButtonGroup>
              </Box>
            </GridItem>
          </Grid>
          <NewAgendaDialog
            userAgendaItem={agendaItemList}
            setAgendaItem={setAgendaItem}
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
            // index={editingIndex}
          />
        </Form>
      )}
    </Formik>
    // <div>
    //   <h1>Room pls {data.id}</h1>
    // </div>
  );
};

export default RoomPage;
