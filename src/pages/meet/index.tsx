import { LoaderFn, MakeGenerics, useMatch } from "@tanstack/react-location";
import { Box, Button, SimpleGrid, Text, Stack, Heading, Avatar, Flex } from '@chakra-ui/react';
import { CSSProperties } from "react";

interface Props {
  roomId: string;
  username: string;
  updateRoomId?: React.Dispatch<React.SetStateAction<string | undefined>>;
  updateUsername: React.Dispatch<React.SetStateAction<string>>;
  updateTokens: React.Dispatch<
    React.SetStateAction<{ clientToken: string; refreshToken: string }>
  >;
  clientToken: string;
  refreshToken: string;
}

const boxStyle: CSSProperties = {
  position: "absolute",
  width: "1061px",
  height: "165px",
  left: "92px",
  top: "89px",
}

export const MeetHome = () => {
  return (
    <Box style={boxStyle}>
      <SimpleGrid columns={4} spacing={10}>
        <Box>
          <Stack>
            <Text>12345</Text>
            <Text>12345</Text>
            <Flex>
              <Button colorScheme='green' size='lg'>
                Join
              </Button>
              <Button colorScheme='red' size='lg'>
                Reject
              </Button>
            </Flex>
          </Stack>
        </Box>
        <Box>
          <Heading as='h6' size='xs'>
            Mentor
          </Heading>
          <Avatar>B</Avatar>
          <Text></Text>
        </Box>
        <Box>
          <Heading as='h6' size='xs'>
            Date
          </Heading>
          <Text>August 1st, 2022</Text>
        </Box>
        <Box>
          <Heading as='h6' size='xs'>
            Time
          </Heading>
          <Text>5:30 PM</Text>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default MeetHome;