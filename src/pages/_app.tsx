import { User } from "@prisma/client";
import { LoaderFn, MakeGenerics, useMatch } from "@tanstack/react-location";
import { useEffect, useState } from "react";
import { UserContextProvider } from "../components/UserContext";
import MainContainer from "../container";

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
  const [user, setUser] = useState<User | undefined>();
  const fetchUser = async () => {
    const { user } = await loader();
    setUser(user);
  };
  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, []);
  return <UserContextProvider user={user}><MainContainer>{children}</MainContainer></UserContextProvider>;
};

export default App;
