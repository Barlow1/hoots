import { Box, Container } from "@chakra-ui/react";
import SideNavWithHeader from "./components/SideNavWithHeader";

interface ContainerProps {
  children: React.ReactNode;
}
const MainContainer = ({ children }: ContainerProps): JSX.Element => {
  return (
    <Box>
        <SideNavWithHeader>{children}</SideNavWithHeader>
    </Box>
  );
};

export default MainContainer;
