import { Container as ChakraContainer } from "@chakra-ui/react";

interface ContainerProps {

  children: React.ReactNode;
}
const Container = ({ children }: ContainerProps): JSX.Element => {
  return <ChakraContainer maxW='container.lg'>{children}</ChakraContainer>;
};

export default Container;
