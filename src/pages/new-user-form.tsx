import {
  FormControl,
  FormLabel,
  //   FormErrorMessage,
  Input,
  FormHelperText,
  Box,
  Text,
  Button,
  Select,
  NumberInput,
  NumberInputStepper,
  NumberInputField,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Stack,
  Textarea,
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
  const IndustryList = ['Marketing', 'Engineering', 'Product Design', 'Small Buisness']
  return (
    <Box   margin='30%'
    width='50%' boxShadow='2xl' padding='3' maxW='sm' borderWidth='1px' borderRadius='lg' overflow='hidden'>  
      <Text style={{fontWeight: 'bold'}}>About Me</Text>
    <Formik
      initialValues={{ firstName: '', lastName: '', industry: '', experience: ''}}
      onSubmit={(values, actions) => {
        setTimeout(() => {
          alert(JSON.stringify(values, null, 2))
          actions.setSubmitting(false)
        }, 1000)
      }}
    >
      {(props) => (
        <Form style={{padding: 5}}>
          <Stack spacing={3}>
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
          <Field name='industry'>
              {({ field }) => (
                  <FormControl>
                    <FormLabel>
                      Industry
                    </FormLabel>
                    <Select {...field} placeholder='Select Industry'>
                      {IndustryList.map(
                        (industry) => { 
                          return <option>{industry}</option>
                          })
                      }
                    </Select>
                  </FormControl>
              )}
          </Field>
          <Field name='experience'>
              {({ field, form }) => (
                  <FormControl>
                    <FormLabel>Experience</FormLabel>
                    <NumberInput 
                      min={0}     
                      {...field}    
                      onChange={(val) =>
                        form.setFieldValue(field.name, val)
                    }>
                      <NumberInputField {...field} placeholder='Years of Experience'/>
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
              )}
          </Field>
          <Field name='bio'>
              {({ field }) => (
                  <FormControl>
                    <FormLabel>Tell us about yourself!</FormLabel>
                    <Textarea size='sm' {...field} placeholder="I work at...&#10;I am currently learning...&#10;I'm looking for a mentor with skills in..." />
                  </FormControl>
              )}
          </Field>
          <Button marginTop='5px' background='brand.200' textColor='white' isLoading={props.isSubmitting} type='submit'>
            Submit
          </Button>
          </Stack>
        </Form>
        )}
     </Formik>
    </Box>
  );
};

export default NewUserForm;
