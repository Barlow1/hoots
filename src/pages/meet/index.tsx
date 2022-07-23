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