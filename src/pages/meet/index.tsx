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

export const MeetHome = (props: any) => {
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

  return (
    <Box>
      <MeetDeets />
      <Button colorScheme={'purple'}></Button>
      <MeetTable rows={mockData} />
    </Box>
  );
};

export default MeetHome;