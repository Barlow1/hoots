import {
  FormControl,
  FormLabel,
  //   FormErrorMessage,
  Input,
  FormHelperText,
} from "@chakra-ui/react";

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
  return (
    <FormControl>
      <FormLabel>Email address</FormLabel>
      <Input type="email" />
      <FormHelperText>We'll never share your email.</FormHelperText>
    </FormControl>
  );
};

export default NewUserForm;
