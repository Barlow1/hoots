import {
  Box,
  Button,
  Link,
  Grid,
  Text,
  Stack,
  Heading,
  Avatar,
  Flex,
  Spacer,
  Wrap,
  WrapItem,
  ButtonGroup,
  GridItem,
} from '@chakra-ui/react';
import type { CSSProperties } from 'react';
import { CloseIcon, PhoneIcon } from '@chakra-ui/icons';
import getRoomCode, { generateToken } from '../../utils/telnyx';
import { routes } from '../../routes';

const headingStyle: CSSProperties = {
  color: '#A0AEC0',
  fontWeight: '700',
  paddingBottom: '5px',
};

export interface IMeetDeetsProps {
  mentorId: string;
  mentorName: string;
  upcomingMeetingDate: string;
  upcomingMeetingTime: string;
}

const pad = '5';

function MeetDeets(props: IMeetDeetsProps) {
  const {
    mentorId, mentorName, upcomingMeetingDate, upcomingMeetingTime,
  } = props;

  const handleJoinButtonClick = async () => {
    const roomCode = await getRoomCode();
    const token = await generateToken(roomCode);
    console.log(roomCode);
    console.log(token);
  //   if (roomCode && token) {
  //     console.log("attempting to go");
  //     window?.location?.replace(
  //       `https://telnyx-meet-demo.vercel.app/rooms/${roomCode}?client_token=${token.token}&refresh_token=${token.refresh_token}`
  //     );
  //   }
  // };
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      m="8"
      boxShadow="2xl"
    >
      <Grid
        h="200px"
        templateRows="repeat(2, 1fr)"
        templateColumns="repeat(4, 1fr)"
        gap={4}
      >
        <GridItem rowSpan={2} colSpan={1}>
          <Flex flexDirection="column" justifyContent="space-between">
            <Box p={pad}>
              <Wrap>
                <WrapItem>
                  <Stack>
                    <Heading as="h4" size="md">
                      Upcoming Meeting
                    </Heading>
                    <Link href={`${routes.meet}/${mentorId}`}>{mentorId}</Link>
                  </Stack>
                </WrapItem>
              </Wrap>
            </Box>
            <Spacer />
            <Box p={pad}>
              <ButtonGroup gap="2">
                <Button
                  backgroundColor="brand.200"
                  color="white"
                  size="lg"
                  variant="solid"
                  onClick={handleJoinButtonClick}
                >
                  <Text style={{ paddingRight: '10px' }}>Join</Text>
                  <PhoneIcon />
                </Button>
                <Button
                  backgroundColor="buttons.fail"
                  color="white"
                  size="lg"
                  variant="solid"
                >
                  <Text style={{ paddingRight: '10px' }}>Reject</Text>
                  <CloseIcon />
                </Button>
              </ButtonGroup>
            </Box>
          </Flex>
        </GridItem>
        <GridItem rowSpan={2} colSpan={1} p={pad}>
          <Heading as="h6" size="s" style={headingStyle}>
            Mentor
          </Heading>
          <Flex dir="row" flexWrap="nowrap">
            <Wrap>
              <WrapItem>
                <Avatar size="sm" />
              </WrapItem>
              <WrapItem>
                <Text>{mentorName}</Text>
              </WrapItem>
            </Wrap>
          </Flex>
        </GridItem>
        <GridItem rowSpan={2} colSpan={1} p={pad}>
          <Heading as="h6" size="s" style={headingStyle}>
            Date
          </Heading>
          <Text>{upcomingMeetingDate}</Text>
        </GridItem>
        <GridItem rowSpan={2} colSpan={1} p={pad}>
          <Heading as="h6" size="s" style={headingStyle}>
            Time
          </Heading>
          <Text>{upcomingMeetingTime}</Text>
        </GridItem>
      </Grid>
    </Box>
  );
}

export default MeetDeets;
