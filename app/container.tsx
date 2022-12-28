// eslint-disable-next-line import/no-cycle
import SideNavWithHeader from './components/SideNavWithHeader';

interface ContainerProps {
  children: React.ReactNode;
}
function MainContainer({ children }: ContainerProps): JSX.Element {
  return (
    <div>
      <SideNavWithHeader>{children}</SideNavWithHeader>
    </div>
  );
}

export default MainContainer;
