import * as React from 'react';
import { CSSProperties } from "react";
import MeetDeets from "./MeetDeets";
import MeetTable, { IMeetTableRowProps } from "./MeetTable";
import { AddIcon } from '@chakra-ui/icons'
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
} from '@chakra-ui/react'

const headingStyle: CSSProperties = {
  color: "#A0AEC0",
  fontWeight: "700",
}

const mockData: IMeetingData[] = [
  {
    id: '12345',
    name: 'Matt Dodds',
    date: 'August 1st, 2022',
    time: '5:30 PM',
  },
  {
    id: '12345',
    name: 'Matt Dodds',
    date: 'September 1st, 2022',
    time: '5:20 PM',
  },
  {
    id: '23456',
    name: 'Jim Patel',
    date: 'January 1st, 2023',
    time: '5:15 PM',
  },
]

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
  const [allMeetingData, setAllMeetingData] = React.useState(props.meetingData || mockData);
  const { isOpen, onOpen, onClose } = useDisclosure();

  React.useEffect(() => {
    if (props.meetingData) {
      setAllMeetingData(props.meetingData);
    }
  }, []);

  const handleClick = (e: any) => {
    console.log(e);
  }

  return (
    <Box>
      <MeetDeets
        mentorId={allMeetingData[0].id}
        mentorName={allMeetingData[0].name}
        upcomingMeetingDate={allMeetingData[0].date}
        upcomingMeetingTime={allMeetingData[0].time}
      />
      <Flex justify={'end'}>
        <Box paddingRight={'32px'}>
          <Spacer />
          <Button color='white' bg={'brand.200'} size={'lg'} onClick={onOpen}>
            <Text style={{ paddingRight: '10px' }}>New Meeting</Text>
            <AddIcon />
          </Button>
        </Box>
      </Flex>
      <MeetTable rows={allMeetingData} />
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modal Title</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            test
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant='ghost'>Secondary Action</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MeetHome;