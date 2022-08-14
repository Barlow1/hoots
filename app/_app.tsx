import { Profile } from "@prisma/client";
import { useLocation } from "@remix-run/react";
import MainContainer from "./container";
import { routes } from "./routes";

interface AppProps {
  children: React.ReactNode;
  user: Profile;
}

const App = ({ children, user }: AppProps) => {
  const location = useLocation();
  if (
    [routes.preferences, routes.login, routes.signup].includes(
      location.pathname
    )
  ) {
    return <>{children}</>;
  }

  return <MainContainer>{children}</MainContainer>;
};

export default App;
