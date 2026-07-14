import {
  Checkbox,
  Form,
  Grid,
  Modal,
  ModalVariant,
  Select,
  SelectDirection,
  SelectOption,
  SelectVariant,
  Text,
  TextInput,
} from '@patternfly/react-core';
import { FormEvent, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useMutation, useQueryClient } from 'react-query';
import { choosableColors, Color, Customer, Customers, postNewCustomer } from 'src/api/CustomerApi';
import { SnazzyButton } from 'src/components/SnazzyButton';

const useStyles = createUseStyles({
  inlineText: {
    display: 'block',
  },
});

export const AddCustomerModal = ({ isModalOpen, setIsModalOpen }: { isModalOpen: boolean, setIsModalOpen: (isModalOpen: boolean) => void }) => {
  const classes = useStyles();
  const queryClient = useQueryClient();

  const [newUser, setNewUser] = useState<Partial<Customer>>({ isCool: false });
  const [selectToggle, setSelectToggle] = useState(false);

  const addCustomerMutation = useMutation({
    mutationFn: postNewCustomer,
    onMutate: async (newCustomer) => {
      await queryClient.cancelQueries('customers');
      const previousCustomers = queryClient.getQueryData<Customers>('customers');
      queryClient.setQueryData<Customers>('customers', (old) => [...(old ?? []), newCustomer]);

      setNewUser({ isCool: false });
      setIsModalOpen(false);
      return { previousCustomers };
    },
    onError: (_error, _newCustomer, context) => {
      queryClient.setQueryData('customers', () => context?.previousCustomers);
    },
    onSettled: () => {
      queryClient.invalidateQueries('customers');
    },
  });

  const onSubmit = (e: FormEvent<Element>) => {
    e.preventDefault();
    addCustomerMutation.mutate(newUser as Customer);
  };

  return (
    <Modal
        variant={ModalVariant.small}
        title='Add Customer'
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <Form onSubmit={onSubmit}>
          <Grid className={classes.inlineText}>
            <Text>Name</Text>
            <TextInput
              onChange={(value) => setNewUser({ ...newUser, name: value })}
              value={newUser.name || ''}
              id='name'
              type='text'
            />
          </Grid>
          <Grid className={classes.inlineText}>
            <Text>Age</Text>
            <TextInput
              onChange={(value) => setNewUser({ ...newUser, age: Number(value) })}
              value={newUser.age || ''}
              id='age'
              type='number'
            />
          </Grid>
          <Grid className={classes.inlineText}>
            <Text>Color</Text>
            <Select
              onToggle={() => setSelectToggle(!selectToggle)}
              isOpen={selectToggle}
              onSelect={(_e, value) => {
                if (typeof value === 'string')
                  setNewUser({ ...newUser, color: value as Color });
                setSelectToggle(false);
              }}
              id='color'
              variant={SelectVariant.single}
              placeholderText='Select a color'
              selections={newUser?.color}
              direction={SelectDirection.up}
            >
              {choosableColors.map((color: string, index) => (
                <SelectOption style={{ color }} key={index} value={color} />
              ))}
            </Select>
          </Grid>
          <Checkbox
            label='Is this person cool?'
            id='isCool'
            onChange={(value) => setNewUser({ ...newUser, isCool: value })}
            isChecked={newUser.isCool}
          />
          <SnazzyButton type='submit' isSnazzy={true}>Submit</SnazzyButton>
        </Form>
      </Modal>
  )
}