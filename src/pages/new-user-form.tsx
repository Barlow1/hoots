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
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Tooltip,
  SliderMark,
  Link,
  IconButton,
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";
import { useState } from "react";
import Logo from "../assets/Logo.svg";
import { routes } from "../routes";


const NewUserForm = () => {
  const IndustryList = ['Marketing', 'Engineering', 'Product Design', 'Small Buisness'];
  const [sliderValue, setSliderValue] = useState<any>(0);
  const [showTooltip, setShowTooltip] = useState(false);
  return (
  <Box   
    margin='auto'
    width='50%' 
    boxShadow='2xl' 
    padding='3' 
    maxW='sm' 
    borderWidth='1px' 
    borderRadius='lg' 
    overflow='hidden'
  >  
    <Text style={{fontWeight: 'bold'}}>
      About Me
    </Text>
    <Formik
      initialValues={{ firstName: '', lastName: '', industry: '', experience: '', bio: '', mentorPrice: '', mentorExperience: ''}}
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
                {({ field }:{[key:string]:any}) => (
                    <FormControl>
                      <FormLabel>First name</FormLabel>
                      <Input {...field} placeholder='First Name' />
                    </FormControl>
                )}
            </Field>
            <Field name='lastName'>
                {({ field }:{[key:string]:any}) => (
                    <FormControl>
                      <FormLabel>Last name</FormLabel>
                      <Input {...field} placeholder='Last Name' />
                    </FormControl>
                )}
            </Field>
            <Field name='industry'>
                {({ field }:{[key:string]:any}) => (
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
                {({ field, form }:{[key:string]:any}) => (
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
                {({ field }:{[key:string]:any}) => (
                    <FormControl>
                      <FormLabel>Tell us about yourself!</FormLabel>
                      <Textarea size='sm' {...field} placeholder="I work at...💼&#10;I am currently learning...📚&#10;I'm looking for a mentor with skills in...🧑🏽‍🏫" />
                    </FormControl>
                )}
            </Field>
            {/* <Text style={{fontWeight: 'bold'}}>Desired Mentor</Text> */}
            <Field name='mentorExperience'>
                {({ field, form }:{[key:string]:any}) => (
                    <FormControl>
                      <FormLabel>Desired Mentor Experience</FormLabel>
                      <NumberInput 
                        min={0}     
                        {...field}    
                        onChange={(val) =>
                          form.setFieldValue(field.name, val)
                      }>
                        <NumberInputField {...field} placeholder='Mentors Experience (years)'/>
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                )}
            </Field>
            <Field name='mentorPrice'>
                {({ field, form }:{[key:string]:any}) => (
                    <FormControl>
                      <FormLabel>Desired Mentor Monthly Cost</FormLabel>   
                      <Slider 
                        {...field} 
                        aria-label='slider-ex-2'  
                        onChange={(val) => {
                          if(val <= 10 ) {
                            setSliderValue('Free');
                          }
                          else if (val > 10 && val <= 30) {
                            setSliderValue('💰');
                          }
                          else if (val > 30 && val <= 50) {
                            setSliderValue('💰💰');
                          }
                          else if (val > 50 && val <= 70) {
                            setSliderValue('💰💰💰');
                          }
                          else if (val > 70 && val <= 90) {
                            setSliderValue('💰💰💰💰');
                          }
                          else{
                            setSliderValue('💰💰💰💰💰');
                          }
                          form.setFieldValue(field.name, val)}}       
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                      >
                        <SliderTrack bg='brand.200' >
                          <SliderFilledTrack bg='brand.900'/>
                        </SliderTrack>
                        <Tooltip
                          hasArrow
                          bg='brand.200'
                          color='white'
                          placement='top'
                          isOpen={showTooltip}
                          label={sliderValue}
                        >
                        <SliderThumb boxSize={6}>
                          <img src={Logo} alt="Hoots Logo" />
                        </SliderThumb>
                        </Tooltip>
                      </Slider>
                    </FormControl>
                )}
            </Field>
            <Stack spacing={4} direction='row' align='center' justifyContent='center'>
              <Button 
                background='brand.200' 
                textColor='white' 
                isLoading={props.isSubmitting} 
                type='submit'
              >
                Submit
              </Button>
              <Link
                href={routes.home}
                style={{ textDecoration: "none", display: "flex" }}
                _focus={{ boxShadow: "none" }}
              >
                <Button
                  background='brand.200' 
                  textColor='white' 
                >
                  Skip
                </Button> 
              </Link>
            </Stack>
          </Stack>
        </Form>
      )}
    </Formik>
  </Box>
  );
};

export default NewUserForm;
