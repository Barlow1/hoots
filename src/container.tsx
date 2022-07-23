import { Container } from "@chakra-ui/react";

interface ContainerProps {
  children: React.ReactNode;
}
const MainContainer = ({ children }: ContainerProps): JSX.Element => {
  return <Container maxW="container.lg">{children}</Container>;
};

export default MainContainer;
