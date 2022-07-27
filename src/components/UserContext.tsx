import { Profile } from "@prisma/client";
import React from "react";
import { createContext, useContext, useEffect } from "react";
import useLocalStorage from "../utils/useLocalStorage";

type UserContextValue = [
  Profile | null,
  React.Dispatch<React.SetStateAction<Profile | null>>
];

interface UserContextProviderProps {
  fetchedUser: Profile | null;
  children: React.ReactNode;
}

const UserLocalStorageId = "HootsUser";

const UserContext = createContext<UserContextValue | undefined>(undefined);
export const UserContextProvider = ({
  children,
  fetchedUser,
}: UserContextProviderProps) => {
  const [user, setUser] = useLocalStorage<Profile | null>(
    UserLocalStorageId,
    fetchedUser
  );
  return (
    <UserContext.Provider value={[user, setUser]}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw Error("useUser must be used within a UserContextProvider");
  }
  return context;
};

export const getStoredUser = () => {
  const user = JSON.parse(localStorage.getItem(UserLocalStorageId) ?? "null");
  return user;
};

export default UserContext;
