import {
  Button,
  Grid,
  GridItem,
} from '@patternfly/react-core';
import { Caption, TableComposable, Tbody, Th, Thead, Tr } from '@patternfly/react-table';
import { useState } from 'react';
import { useQuery } from 'react-query';
import { getCustomers } from 'src/api/CustomerApi';
import { ColoredTd } from 'src/components/ColoredTd';
import Loader from 'src/components/Loader';
import { useAppContext } from 'src/middleware';
import { AddCustomerModal } from 'src/components/AddCustomerModal';


export default () => {
  const { setDarkmode, darkmode } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Queries
  const { isLoading, data } = useQuery(
    'customers',
    getCustomers,
    // TODO: Stretch - Use the options object to handle errors.
  );

  const columnHeaders = ['Name', 'Age', 'Is Cool'];

  if (isLoading) return <Loader />;
  return (
    <Grid>
      <GridItem sm={6}>
        <Button onClick={() => setDarkmode(!darkmode)} variant='secondary'>
          {darkmode ? 'LightMode' : 'DarkMode'}
        </Button>
      </GridItem>
      <GridItem sm={6}>
        <Button onClick={() => setIsModalOpen(true)} variant='secondary'>
          Add New Customer
        </Button>
      </GridItem>
      <AddCustomerModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
      <Grid>
        <TableComposable aria-label='Simple table' variant='compact'>
          <Caption>Here is a list of your customers:</Caption>
          <Thead>
            <Tr>
              {columnHeaders.map((columnHeader) => (
                <Th key={columnHeader}>{columnHeader}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {data?.map(({ name, age, color, isCool }, key: number) => (
              <Tr key={name + key}>
                <ColoredTd color={color} dataLabel='name'>
                  {name}
                </ColoredTd>
                <ColoredTd color={color} dataLabel='age'>
                  {age}
                </ColoredTd>
                <ColoredTd color={color} dataLabel='isCool'>
                  {isCool ? 'Yup' : 'Totally Not!'}
                </ColoredTd>
              </Tr>
            ))}
          </Tbody>
        </TableComposable>
      </Grid>
    </Grid>
  );
};
