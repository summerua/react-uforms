/* eslint-disable @typescript-eslint/no-empty-function */
import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { Form, CustomField } from '../../index';

afterEach(() => {
  cleanup();
});

test('renders without crashing', () => {
  const { unmount } = render(
    <Form onSubmit={() => {}}>
      <CustomField name="profile.firstName">{() => <>Some component</>}</CustomField>
    </Form>,
  );
  unmount();
});

test('change input value -> submit form', () => {
  const submit = jest.fn();
  const { getByTestId } = render(
    <Form onSubmit={submit} data-testid="form">
      <CustomField name="profile.firstName">
        {({ setValue }) => (
          <button type="button" onClick={() => setValue('John')} data-testid="input">
            Some component
          </button>
        )}
      </CustomField>
    </Form>,
  );
  const input = getByTestId('input');
  const form = getByTestId('input');
  fireEvent.click(input);
  fireEvent.submit(form);
  expect(submit).toHaveBeenCalledWith(
    {
      profile: {
        firstName: 'John',
      },
    },
    expect.any(Object),
  );
});

test('set default values -> change input value -> submit form', () => {
  const submit = jest.fn();
  const defaultValues = {
    email: 'test@example.com',
    profile: {
      firstName: 'John',
      lastName: 'Brown',
    },
  };
  const { getByTestId } = render(
    <Form onSubmit={submit} defaultValues={defaultValues} data-testid="form">
      <CustomField name="profile.firstName">
        {({ setValue, getValue }) => (
          <button type="button" onClick={() => setValue('Bill')} data-testid="input">
            {getValue()}
          </button>
        )}
      </CustomField>
    </Form>,
  );
  const input = getByTestId('input');
  const form = getByTestId('input');
  expect(input.innerHTML).toBe('John');
  fireEvent.click(input);
  fireEvent.submit(form);
  expect(input.innerHTML).toBe('Bill');
  fireEvent.submit(form);
  expect(submit).toHaveBeenCalledWith(
    {
      email: 'test@example.com',
      profile: {
        firstName: 'Bill',
        lastName: 'Brown',
      },
    },
    expect.any(Object),
  );
});

test('without form', () => {
  const log = jest.spyOn(global.console, 'error');
  render(<CustomField name="profile.firstName">{() => <>Some component</>}</CustomField>);
  expect(log).toHaveBeenCalledWith('Could not found Form API. Make sure <CustomField/> is in the <Form/>.');
});
