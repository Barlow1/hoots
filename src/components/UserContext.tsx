import { User } from "@prisma/client";
import { createContext, useContext } from "react";

interface UserContextValue {
  user: User | undefined;
}

interface UserContextProviderProps {
    user: User | undefined;
    children: React.ReactNode;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);
export const UserContextProvider = ({user, children}: UserContextProviderProps) => {

    return (
        <UserContext.Provider value={{user}}>
            {children}
        </UserContext.Provider>
    )
};

export const useUser = () => {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
      }
      return context
}

export default UserContext;
