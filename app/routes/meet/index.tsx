import * as React from "react";
import { CSSProperties } from "react";
import MeetDeets from "./MeetDeets";
import MeetTable from "./MeetTable";
import { AddIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  Box,
  Text,
  Flex,
  Spacer,
  Select,
  Stack,
  Heading,
  Textarea,
  Input,
} from "@chakra-ui/react";
import { Meeting } from "@prisma/client";
import { json, LoaderFunction } from "@remix-run/node";

const mockData: IMeetingData[] = [
  {
    id: "12345",
    name: "Matt Dodds",
    date: "August 1st, 2022",
    time: "5:30 PM",
  },
  {
    id: "12345",
    name: "Matt Dodds",
    date: "September 1st, 2022",
    time: "5:20 PM",
  },
  {
    id: "23456",
    name: "Jim Patel",
    date: "January 1st, 2023",
    time: "5:15 PM",
  },
  {
    id: "23456",
    name: "Jim Patel",
    date: "January 2nd, 2023",
    time: "5:15 PM",
  },
  {
    id: "23456",
    name: "Jim Patel",
    date: "January 3rd, 2023",
    time: "5:15 PM",
  },
];

type Route = {
  LoaderData: { meetings: Meeting[] };
  Params: { id: string };
};

export const loader: LoaderFunction = async () => {
  const baseUrl = process.env.URL;
  const meetings: Meeting[] = await fetch(
    `${baseUrl}/.netlify/functions/get-meetings`
  )
    .then((meeting) => meeting.json())
    .catch(() => {
      console.error("Failed to get meetings, please try again in a few minutes.");
    });

  return json({ data: { meetings: meetings as Meeting[] } });
};

export interface IMeetingData {
  id: string;
  name: string;
  date: string;
  time: string;
}

export interface IMeetHomeProps {
  meetingData: IMeetingData[];
}

export const MeetHome = (props: IMeetHomeProps) => {
  const [allMeetingData, setAllMeetingData] = React.useState(
    props.meetingData || mockData
  );
  const { isOpen, onOpen, onClose } = useDisclosure();

  React.useEffect(() => {
    if (props.meetingData) {
      setAllMeetingData(props.meetingData);
    }
  }, []);

  const handleClick = (e: any) => {
    console.log(e);
  };

  return (
    <Box>
      <MeetDeets
        mentorId={allMeetingData[0].id}
        mentorName={allMeetingData[0].name}
        upcomingMeetingDate={allMeetingData[0].date}
        upcomingMeetingTime={allMeetingData[0].time}
      />
      <Flex justify={"end"}>
        <Box paddingRight={"32px"}>
          <Spacer />
          <Button color="white" bg={"brand.200"} size={"lg"} onClick={onOpen}>
            <Text style={{ paddingRight: "10px" }}>New Meeting</Text>
            <AddIcon />
          </Button>
        </Box>
      </Flex>
      <MeetTable rows={allMeetingData} />
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>New Meeting</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={3}>
              <Heading as="h5" size="sm">
                Mentor
              </Heading>
              <Select placeholder="Select..." size="md">
                <option value="option1">Linus Torvalds</option>
                <option value="option2">Christian Barlow</option>
                <option value="option3">Jessie Murphey</option>
              </Select>
              <Heading as="h5" size="sm">
                When
              </Heading>
              <Input />
              <Heading as="h5" size="sm">
                Notes
              </Heading>
              <Textarea />
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button
              backgroundColor={"brand.200"}
              color="white"
              size="lg"
              mr={3}
              onClick={onClose}
            >
              Save
            </Button>
            <Button
              backgroundColor={"buttons.fail"}
              color="white"
              size="lg"
              onClick={onClose}
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MeetHome;
