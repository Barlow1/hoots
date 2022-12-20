import React from "react";
import { ThemeContext } from "~/components/ThemeProvider";

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme cannot be used outside of a ThemeProvider");
  }
  return context;
}

export default useTheme;