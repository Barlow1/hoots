import React from "react";
import ReactDOM from "react-dom/client";

import { Routes } from "generouted";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
const colors = {
  brand: {
    900: "#6D29EF",
    500: "#805ad5",
    200: "#9f7aea",
  },
  fail: {
    300: "#FC8181",
  }
};

const theme = extendTheme({ colors });

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <Routes />
    </ChakraProvider>
  </React.StrictMode>
);
