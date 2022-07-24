import {
  FormControl,
  FormLabel,
  //   FormErrorMessage,
  Input,
  FormHelperText,
  Box,
  Text,
  Button,
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";
// import { colors } from '../main'
/*
About Me:
- Journey (Area of Interest)
- Experience (years)
- Bio
- Availability

Desired Mentor:
- Experience (years)
- Desired Monthly Cost [Range Slider FREE-$$$]
*/

const NewUserForm = () => {
  // console.log(brand.200)
  return (
    <Box   margin='30%'
    width='50%' boxShadow='2xl' padding='3' maxW='sm' borderWidth='1px' borderRadius='lg' overflow='hidden'>  
      <Text style={{fontWeight: 'bold'}}>About Me</Text>
    <Formik
      initialValues={{ firstName: '', lastName: '' }}
      onSubmit={(values, actions) => {
        setTimeout(() => {
          alert(JSON.stringify(values, null, 2))
          actions.setSubmitting(false)
        }, 1000)
      }}
    >
      {(props) => (
        <Form style={{padding: 5}}>
         <Field name='firstName'>
            {({ field }) => (
                <FormControl>
                  <FormLabel>First name</FormLabel>
                  <Input {...field} placeholder='First Name' />
                </FormControl>
            )}
         </Field>
         <Field name='lastName'>
            {({ field }) => (
                <FormControl>
                  <FormLabel>Last name</FormLabel>
                  <Input {...field} placeholder='Last Name' />
                </FormControl>
            )}
         </Field>
        <Button marginTop='5px' background='brand.200' isLoading={props.isSubmitting} type='submit'>Button</Button>
        </Form>
        )}
     </Formik>
    </Box>
  );
};

export default NewUserForm;
