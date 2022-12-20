import { Box } from '@chakra-ui/react';
// eslint-disable-next-line import/no-cycle
import SideNavWithHeader from './components/SideNavWithHeader';

interface ContainerProps {
  children: React.ReactNode;
}
function MainContainer({ children }: ContainerProps): JSX.Element {
  return (
    <Box>
      <SideNavWithHeader>{children}</SideNavWithHeader>
    </Box>
  );
}

export default MainContainer;
