import { LoaderFn, MakeGenerics, useMatch } from "@tanstack/react-location";
import { Box, Button, SimpleGrid, Text, Stack, Heading, Avatar, Flex, Wrap, WrapItem } from '@chakra-ui/react';
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
    <Box style={boxStyle} borderWidth='1px' borderRadius='lg' overflow='hidden'>
      <SimpleGrid columns={4} spacing={10}>
        <Box>
          <Wrap>
            <WrapItem>
              <Stack>
                <Heading as='h4' size='md'>Upcoming Meeting</Heading>
                <Text>12345</Text>
                <Flex>
                  <Wrap>
                    <WrapItem>
                      <Button colorScheme='green' size='lg' variant='solid'>
                        Join
                      </Button>
                    </WrapItem>
                    <WrapItem>
                      <Button colorScheme='red' size='lg' variant='solid'>
                        Reject
                      </Button>
                    </WrapItem>
                  </Wrap>
                </Flex>
              </Stack>
            </WrapItem>
          </Wrap>
        </Box>
        <Box>
          <Heading as='h6' size='s'>
            Mentor
          </Heading>
          <Avatar size='sm' />
          <Text></Text>
        </Box>
        <Box>
          <Heading as='h6' size='s'>
            Date
          </Heading>
          <Text>August 1st, 2022</Text>
        </Box>
        <Box>
          <Heading as='h6' size='s'>
            Time
          </Heading>
          <Text>5:30 PM</Text>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default MeetHome;