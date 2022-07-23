import { Heading, Text } from "@chakra-ui/react";

function App() {
  return (
    <div className="App">
      <div>
        <Heading as="h1" size="4xl" noOfLines={1}>
          Hoots
        </Heading>
        <Text fontSize="md">Find a mentor who gives a hoot!</Text>
      </div>
    </div>
  );
}

export default App;
