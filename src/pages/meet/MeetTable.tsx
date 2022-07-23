import {
  Box,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Link
} from '@chakra-ui/react'
import { CSSProperties } from "react";

export interface IMeetTableProps {
  rows: IMeetTableRowProps[];
}

export interface IMeetTableRowProps {
  id: string;
  name: string;
  time: string;
}

export const MeetTableRow = (props: IMeetTableRowProps):JSX.Element => {
  return (
    <Tr>
      <Td>
        <Link>{props.id}</Link>
      </Td>
      <Td>{props.name}</Td>
      <Td>{props.time}</Td>
    </Tr>
  )
}

export const MeetTable = (props: IMeetTableProps) => {
  return (
    <Box borderWidth='1px' borderRadius='lg' overflow='hidden' m='8'>
      <TableContainer maxW={'100%'}>
        <Table variant='simple'>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Mentor</Th>
              <Th>Date</Th>
            </Tr>
          </Thead>
          <Tbody>
            {props.rows.map(r => <MeetTableRow id={r.id} name={r.name} time={r.time} />)}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MeetTable;
