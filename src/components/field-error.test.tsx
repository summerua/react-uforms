/* eslint-disable @typescript-eslint/no-empty-function */
import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { Form, FieldError, Text, Validator } from '../index';

afterEach(() => {
  cleanup();
});

test('renders without crashing', () => {
  const { unmount } = render(
    <Form onSubmit={() => {}}>
      <FieldError name="profile.firstName" />
    </Form>,
  );
  unmount();
});

test('submit form', () => {
  const validation = () => ({
    profile: {
      firstName: [Validator.Required()],
    },
  });
  const { getByTestId } = render(
    <Form onSubmit={() => {}} validation={validation} data-testid="form">
      <Text name="profile.firstName" />
      <FieldError name="profile.firstName" data-testid="error" />
    </Form>,
  );
  const form = getByTestId('form');
  fireEvent.submit(form);
  expect(getByTestId('error')).toBeInTheDocument();
});

test('touch input', () => {
  const validation = () => ({
    profile: {
      firstName: [Validator.Required()],
    },
  });
  const { getByTestId } = render(
    <Form onSubmit={() => {}} validation={validation}>
      <Text name="profile.firstName" data-testid="input" />
      <FieldError name="profile.firstName" data-testid="error" />
    </Form>,
  );
  const input = getByTestId('input');
  input.focus();
  input.blur();
  expect(getByTestId('error')).toBeInTheDocument();
});

test('change input', () => {
  const validation = () => ({
    profile: {
      firstName: [Validator.Required(), Validator.MinLength(3)],
    },
  });
  const { getByTestId, queryByTestId } = render(
    <Form onSubmit={() => {}} validation={validation}>
      <Text name="profile.firstName" data-testid="input" />
      <FieldError name="profile.firstName" data-testid="error" />
    </Form>,
  );
  const input = getByTestId('input');
  fireEvent.change(input, { target: { value: 'J' } });
  expect(queryByTestId('error')).not.toBeInTheDocument();
});

test('change input – input validateOnChange is on', () => {
  const validation = () => ({
    profile: {
      firstName: [Validator.Required(), Validator.MinLength(3)],
    },
  });
  const { getByTestId } = render(
    <Form onSubmit={() => {}} validation={validation}>
      <Text name="profile.firstName" data-testid="input" validateOnChange={true} />
      <FieldError name="profile.firstName" data-testid="error" />
    </Form>,
  );
  const input = getByTestId('input');
  fireEvent.change(input, { target: { value: 'J' } });
  expect(getByTestId('error')).toBeInTheDocument();
});

test('change input – form validateOnChange is on', () => {
  const validation = () => ({
    profile: {
      firstName: [Validator.Required(), Validator.MinLength(3)],
    },
  });
  const { getByTestId } = render(
    <Form onSubmit={() => {}} validation={validation} validateOnChange={true}>
      <Text name="profile.firstName" data-testid="input" />
      <FieldError name="profile.firstName" data-testid="error" />
    </Form>,
  );
  const input = getByTestId('input');
  fireEvent.change(input, { target: { value: 'J' } });
  expect(getByTestId('error')).toBeInTheDocument();
});

test('change input – form validateOnChange is on - input validateOnChange is off', () => {
  const validation = () => ({
    profile: {
      firstName: [Validator.Required(), Validator.MinLength(3)],
    },
  });
  const { getByTestId, queryByTestId } = render(
    <Form onSubmit={() => {}} validation={validation} validateOnChange={true}>
      <Text name="profile.firstName" data-testid="input" validateOnChange={false} />
      <FieldError name="profile.firstName" data-testid="error" />
    </Form>,
  );
  const input = getByTestId('input');
  fireEvent.change(input, { target: { value: 'J' } });
  expect(queryByTestId('error')).not.toBeInTheDocument();
});

test('without form', () => {
  const log = jest.spyOn(global.console, 'error');
  render(<FieldError name="profile.firstName" data-testid="error" />);
  expect(log).toHaveBeenCalledWith('Could not found Form API. Make sure <FieldError/> is in the <Form/>.');
});
