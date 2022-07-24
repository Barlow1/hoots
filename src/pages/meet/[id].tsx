import { CheckIcon, CloseIcon, EditIcon } from "@chakra-ui/icons";
import { Text, Box, Button, ButtonGroup, Editable, EditableInput, EditablePreview, Flex, FormControl, FormLabel, Grid, GridItem, IconButton, Input, Textarea, useEditableControls, Avatar } from "@chakra-ui/react";
import { LoaderFn, MakeGenerics, useMatch } from "@tanstack/react-location";
import { Field, Form, Formik } from "formik";

type Route = MakeGenerics<{
  LoaderData: { id: string };
  Params: { id: string };
}>;

export const loader: LoaderFn<Route> = async ({ params }) => {
  return { id: params.id };
};

export const RoomPage = () => {
  function EditableControls() {
    const {
      isEditing,
      getSubmitButtonProps,
      getCancelButtonProps,
      getEditButtonProps,
    } = useEditableControls()

    return isEditing ? (
      <ButtonGroup padding='2' size='sm'>
        <IconButton bgColor='brand.500' color='white' icon={<CheckIcon />} {...getSubmitButtonProps()} />
        <IconButton bgColor='brand.500' color='white' icon={<CloseIcon />} {...getCancelButtonProps()} />
      </ButtonGroup>
    ) : (
      <Flex padding='2'>
        <IconButton bgColor='brand.500' color='white' size='sm' icon={<EditIcon />} {...getEditButtonProps()} />
      </Flex>
    )
  }
  const mockData = {"_id":{"$oid":"62dce871f321e7c3d582838a"},"date":"August 1st, 2022","time":"5:30PM","name":"Emily Jones","occupation":"QA Engineer","cost":{"$numberInt":"0"},"tags":["QA","Design","Fun"],"experience":{"$numberInt":"10"},"bio":"QA Engineer at Netlix. I love learning new things and breaking software. Looking to mentor a college student.","company":"Netflix","img":"https://i.ibb.co/C8rVLjB/Adobe-Stock-447929817.jpg"}
  const mockUserData = {agendItemTitle: 'Redux Reducers', notes: 'I wanna be the very best! Like no one ever was, To catch them is my real test!', }
  console.log(mockData.experience);
  const { data } = useMatch<Route>();
  console.log(data);
  return (
    <Formik
    initialValues={{ agendaItem: mockUserData.agendItemTitle, notes: mockUserData.notes, }}
    onSubmit={(values, actions) => {
      setTimeout(() => {
        alert(JSON.stringify(values, null, 2))
        actions.setSubmitting(false)
      }, 1000)
    }}
  >
    {(props) => (
        <Form>

    <Grid templateColumns='repeat(2, 1fr)' gap={6}>
      <GridItem >
        <Box border='1px' borderColor='gray.200' borderRadius='5' padding='5'>
          {/* <Text>hello</Text> */}
        <Field name='agendaItem'>
        {({ field }:{[key:string]:any}) => (
                    <FormControl>

          <Editable fontSize='xl' fontWeight='bold' defaultValue={`${mockUserData.agendItemTitle}`} alignItems='center' display='flex'>
            <EditablePreview />
            <Input {...field} as={EditableInput} />
            <EditableControls />
          </Editable>
          </FormControl>
                )}
        </Field>
      {/* </GridItem> */}
      {/* <GridItem> */}
        <Field name='notes'>
                {({ field }:{[key:string]:any}) => (
                    <FormControl>
                      <FormLabel>Notes</FormLabel>
                      <Textarea size='sm' {...field} placeholder={`${mockUserData.notes}`} />
                    </FormControl>
                )}
          </Field>
          {/* <GridItem pt='2'> */}
          <Button 
                background='brand.200' 
                textColor='white' 
                isLoading={props.isSubmitting} 
                type='submit'
              >
                Submit
              </Button>
          {/* </GridItem> */}
        </Box>
      </GridItem>
        <GridItem>
          <Box padding='5'> 
              <Grid templateColumns='repeat(3, 1fr)' gap={2}>
                <GridItem>
                <Text textColor='#9faec0' fontWeight='bold'>
                                Mentor
                  </Text>
                  <Box pt='2' display='flex'>
                            <Avatar
                            size={"sm"}
                            src={
                                "https://images.unsplash.com/photo-1619946794135-5bc917a27793?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9"
                            }
                            />
                            <Text justifyContent='center' alignItems='center' display='flex' pl='2'fontSize='sm'>
                                {mockData.name}
                            </Text>
                            </Box>
                </GridItem>
                <GridItem>
                <Text textColor='#9faec0' fontWeight='bold'>
                                Date
                  </Text>
                  <Text fontSize='sm'>
                                {mockData.date}
                            </Text>
                  </GridItem>
                  <GridItem>
                <Text textColor='#9faec0' fontWeight='bold'>
                                Time
                  </Text>
                  <Text m='auto' fontSize='sm'>
                                {mockData.time}
                            </Text>
                  </GridItem>
              </Grid>
          </Box>

        </GridItem>
    </Grid>
    </Form>
      )}
    </Formik>
    // <div>
    //   <h1>Room pls {data.id}</h1>
    // </div>
  );
};

export default RoomPage;
