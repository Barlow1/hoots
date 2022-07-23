import { LoaderFn, MakeGenerics, useMatch } from "@tanstack/react-location";
import { Box, Button, Link, Grid, Text, Stack, Heading, Avatar, Flex, Spacer, Wrap, WrapItem, ButtonGroup, GridItem } from '@chakra-ui/react';
import { CSSProperties } from "react";
import MeetDeets from "./MeetDeets";

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

export const MeetHome = () => {
  return (
    <Box>
      <MeetDeets />
    </Box>
  );
};

export default MeetHome;