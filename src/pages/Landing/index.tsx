import {
  Alert,
  Button,
  Grid,
  GridItem,
} from '@patternfly/react-core';
import { ActionsColumn, Caption, TableComposable, Tbody, Th, Thead, Tr, Td, IAction } from '@patternfly/react-table';
import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import { getCustomers, postCustomers, Customers, Customer } from 'src/api/CustomerApi';
import { ColoredTd } from 'src/components/ColoredTd';
import Loader from 'src/components/Loader';
import { useAppContext } from 'src/middleware';
import { AddCustomerModal } from 'src/components/AddCustomerModal';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  darkStyle: {
    background: '#444',
    color: 'white',
    '& th, & td': { color: 'white' },
  },
});

export default () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const classes = useStyles();
  const { setDarkmode, darkmode } = useAppContext();
  const queryClient = useQueryClient();

  const deleteCustomerMutation = useMutation({
    mutationFn: (customerToDelete: Customer) => {
      const customers = queryClient.getQueryData<Customers>('customers') ?? [];
      const updatedCustomers = customers.filter((c) => c.name !== customerToDelete.name);
      return postCustomers(updatedCustomers)();
    },
    onMutate: async (deleteCustomer: Customer) => {
      await queryClient.cancelQueries('customers');
      const previousCustomers = queryClient.getQueryData<Customers>('customers');
      queryClient.setQueryData<Customers>('customers', (old) =>
        (old ?? []).filter((customer) => customer.name !== deleteCustomer.name)
      );
      return { previousCustomers };
    },
    onError: (_error, _customerToDelete, context) => {
      queryClient.setQueryData('customers', () => context?.previousCustomers);
    },
    onSettled: () => {
      queryClient.invalidateQueries('customers');
    },
  });

  // Queries
  const { isLoading, data, isError, error, refetch } = useQuery(
    'customers',
    getCustomers,
    {
      onError: (error) => {
        console.error('Error fetching customers:', error);
      }
    }
  );

  const columnHeaders = ['Name', 'Age', 'Is Cool'];
  
  if (isLoading) return <Loader />;
  if (isError) return (
    <Alert variant="danger" title="Failed to load customers">
      
      <Button onClick={() => refetch()}>{`${String(error)} Retry`}</Button>
    </Alert>
  );
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
      <AddCustomerModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} className={darkmode ? classes.darkStyle : ""} />
      <Grid>
        <TableComposable aria-label='Simple table' variant='compact' className={darkmode ? classes.darkStyle : ""}>
          <Caption>Here is a list of your customers:</Caption>
          <Thead>
            <Tr>
              {columnHeaders.map((columnHeader) => (
                <Th key={columnHeader}>{columnHeader}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {data?.map((customer: Customer, key: number) => {
              const rowActions: IAction[] = [
                {
                  title: 'Delete',
                  onClick: () => deleteCustomerMutation.mutate(customer)
                }
              ];
              return(
                <Tr key={customer.name + key}>
                  <ColoredTd color={customer.color} dataLabel='name'>
                    {customer.name}
                  </ColoredTd>
                  <ColoredTd color={customer.color} dataLabel='age'>
                    {customer.age}
                  </ColoredTd>
                  <ColoredTd color={customer.color} dataLabel='isCool'>
                    {customer.isCool ? 'Yup' : 'Totally Not!'}
                  </ColoredTd>
                  <Td>
                    <ActionsColumn items={rowActions} />
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </TableComposable>
      </Grid>
    </Grid>
  );
};
