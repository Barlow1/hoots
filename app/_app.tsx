import type { Profile } from '@prisma/client';
import { useLocation } from '@remix-run/react';
// eslint-disable-next-line import/no-cycle
import MainContainer from './container';
import { routes } from './routes';

interface AppProps {
  children: React.ReactNode;
  user: Profile;
}

function App({ children, user }: AppProps) {
  const location = useLocation();
  if (
    [
      routes.startAbout,
      routes.login,
      routes.signup,
      routes.start,
      routes.newMentorProfile,
      routes.startCheckEmail,
      routes.startVerifyEmail,
    ].includes(location.pathname)
  ) {
    return <>{children}</>;
  }

  return <MainContainer>{children}</MainContainer>;
}

export default App;
