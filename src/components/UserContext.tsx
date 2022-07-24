import { User } from "@prisma/client";
import { createContext, useContext, useEffect } from "react";

interface UserContextValue {
  user: User | undefined;
}

interface UserContextProviderProps {
  user: User | undefined;
  children: React.ReactNode;
}

const UserLocalStorageId = "HootsUser";

const UserContext = createContext<UserContextValue | undefined>(undefined);
export const UserContextProvider = ({
  user,
  children,
}: UserContextProviderProps) => {
  useEffect(() => {
    if (user) {
      localStorage.setItem(UserLocalStorageId, JSON.stringify(user));
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
  );
};

export const useUser = () => {
  const user = JSON.parse(localStorage.getItem(UserLocalStorageId) ?? "{}");
  return { user };
};

export default UserContext;
