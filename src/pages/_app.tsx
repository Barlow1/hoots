import { Profile } from "@prisma/client";
import {
  LoaderFn,
  MakeGenerics,
  useLocation,
  useMatch,
} from "@tanstack/react-location";
import { useEffect, useState } from "react";
import AuthenticatedRoute from "../components/AuthenticatedRoute";
import { UserContextProvider } from "../components/UserContext";
import MainContainer from "../container";
import { routes } from "../routes";

interface AppProps {
  children: React.ReactNode;
}

const loader = async () => {
  const email = "cbarlow@aais.com";
  const baseUrl = import.meta.env.VITE_API_URL;
  const user = await fetch(
    `${baseUrl}/.netlify/functions/get-user?email=${email}`
  )
    .then((user) => user.json())
    .catch(() => {
      alert("Failed to get user, please try again in a few minutes.");
    });
  return { user };
};

const App = ({ children }: AppProps) => {
  const [user, setUser] = useState<Profile | null>(null);
  const fetchUser = async () => {
    const { user } = await loader();
    setUser(user);
  };
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, []);

  console.log(location.current.pathname);

  if (
    [routes.preferences, routes.login, routes.signup].includes(
      location.current.pathname
    )
  ) {
    return (
      <UserContextProvider fetchedUser={user}>{children}</UserContextProvider>
    );
  }

  return (
    <UserContextProvider fetchedUser={user}>
      <AuthenticatedRoute>
        <MainContainer>{children}</MainContainer>
      </AuthenticatedRoute>
    </UserContextProvider>
  );
};

export default App;
