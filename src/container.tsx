import { Container as ChakraContainer } from "@chakra-ui/react";

interface ContainerProps {
  children: React.ReactNode;
}
const Container = ({ children }: ContainerProps): JSX.Element => {
  return <ChakraContainer>{children}</ChakraContainer>;
};

export default Container;
