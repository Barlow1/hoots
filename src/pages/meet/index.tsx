import { LoaderFn, MakeGenerics, useMatch } from "@tanstack/react-location";
import * as React from 'react';
import { Box, Button, Link, Grid, Text, Stack, Heading, Avatar, Flex, Spacer, Wrap, WrapItem, ButtonGroup, GridItem } from '@chakra-ui/react';
import { CSSProperties } from "react";
import MeetDeets from "./MeetDeets";
import MeetTable, { IMeetTableRowProps } from "./MeetTable";

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

const headingStyle: CSSProperties = {
  color: "#A0AEC0",
  fontWeight: "700",
}

const mockData: IMeetTableRowProps[] = [
  {
    id: '12345',
    name: 'Matt Dodds',
    time: 'August 1st, 2022'
  },
  {
    id: '12345',
    name: 'Matt Dodds',
    time: 'September 1st, 2022'
  },
  {
    id: '23456',
    name: 'Jim Patel',
    time: 'January 1st, 2023'
  },
]

const mockMeetingData = {
  mentorId: '42069',
  mentorName: 'Christian Barlow',
  upcomingMeetingTime: 'April 20, 2023',
}

export interface IMeetingData {
  id: string;
  name: string;
  time: string;
}

export interface IMeetHomeProps {
  meetingData: IMeetingData[];
}

export const MeetHome = (props: IMeetHomeProps) => {
  const [allMeetingData, setAllMeetingData] = React.useState(props.meetingData || mockData);
  return (
    <Box>
      <MeetDeets
        mentorId={allMeetingData[0].id}
        mentorName={allMeetingData[0].name}
        upcomingMeetingTime={allMeetingData[0].time}
      />
      <Button colorScheme={'purple'}>New Meeting</Button>
      <MeetTable rows={allMeetingData} />
    </Box>
  );
};

export default MeetHome;