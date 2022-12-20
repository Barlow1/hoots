/* eslint-disable react/destructuring-assignment */
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Link,
} from '@chakra-ui/react';

export interface IMeetTableProps {
  rows: IMeetTableRowProps[];
}

export interface IMeetTableRowProps {
  id: string;
  name: string;
  date: string;
  time: string;
}

export function MeetTableRow(props: IMeetTableRowProps):JSX.Element {
  return (
    <Tr>
      <Td>
        <Link
          href={`/meet/${props.id}`}
        >
          {props.id}
        </Link>
      </Td>
      <Td>{props.name}</Td>
      <Td>{props.date}</Td>
      <Td>{props.time}</Td>
    </Tr>
  );
}

export function MeetTable(props: IMeetTableProps) {
  return (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden" m="8" boxShadow="2xl">
      <TableContainer maxW="100%">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Mentor</Th>
              <Th>Date</Th>
              <Th>Time</Th>
            </Tr>
          </Thead>
          <Tbody>
            {props.rows.map((r) => <MeetTableRow id={r.id} name={r.name} date={r.date} time={r.time} />)}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default MeetTable;
