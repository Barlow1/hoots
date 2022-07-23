import React from "react";
import ReactDOM from "react-dom/client";

import { Routes } from "generouted";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import MainContainer from "./container";
const colors = {
  brand: {
    900: "#6D29EF",
    500: "#805ad5",
    200: "#9f7aea",
  },
  buttons: {
    fail: "#FC8181",
    disabled: "#cbd5e0",
  },
};

const theme = extendTheme({ colors });

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <MainContainer>
        <Routes />
      </MainContainer>
    </ChakraProvider>
  </React.StrictMode>
);
