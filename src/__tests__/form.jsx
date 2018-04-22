import React from 'react';
import TestRenderer from 'react-test-renderer';

import Yarfl from '../index';

describe('Yarfl.Form', () => {
  test('renders the right content', () => {
    const render = () => 'form!';
    const root = TestRenderer.create(
      <Yarfl.Form onSubmit={() => {}}>{render}</Yarfl.Form>
    );

    expect(root.toJSON()).toBe('form!');
  });

  test("doesn't block renders when the render function changes", () => {
    const App = ({ text }) => (
      <Yarfl.Form onSubmit={() => {}}>{() => text}</Yarfl.Form>
    );
    const root = TestRenderer.create(<App text="before" />);

    expect(root.toJSON()).toBe('before');

    root.update(<App text="after" />);
    expect(root.toJSON()).toBe('after');
  });

  test('handles basic submit', () => {
    const render = jest.fn(() => null);
    const handleSubmit = jest.fn();

    TestRenderer.create(
      <Yarfl.Form onSubmit={handleSubmit}>{render}</Yarfl.Form>
    );

    expect(handleSubmit).not.toBeCalled();

    const e = {
      preventDefault: jest.fn()
    };
    render.mock.calls[0][0].submit(e);

    expect(handleSubmit.mock.calls.length).toBe(1);
    expect(e.preventDefault).toBeCalled();
    expect(render.mock.calls.length).toBe(1);
  });

  test('passes form values to handleSubmit', () => {
    const renderEmail = jest.fn(() => null);
    const renderPassword = jest.fn(() => null);
    const renderThings = jest.fn(() => null);
    const renderForm = jest.fn(() => (
      <React.Fragment>
        <Yarfl.Field name="email">{renderEmail}</Yarfl.Field>
        <Yarfl.Field name="password">{renderPassword}</Yarfl.Field>
        <Yarfl.SubField name="nested">
          <Yarfl.Field name="things">{renderThings}</Yarfl.Field>
        </Yarfl.SubField>
      </React.Fragment>
    ));
    const handleSubmit = jest.fn();

    TestRenderer.create(
      <Yarfl.Form onSubmit={handleSubmit}>{renderForm}</Yarfl.Form>
    );

    renderEmail.mock.calls[0][0].input.onChange({
      target: {
        value: 'example@email.com'
      }
    });
    renderPassword.mock.calls[0][0].input.onChange({
      target: {
        value: 'superSafePassw0rd'
      }
    });
    renderThings.mock.calls[0][0].input.onChange({
      target: {
        value: 'some nested value'
      }
    });
    const e = {
      preventDefault: jest.fn()
    };
    renderForm.mock.calls[0][0].submit(e);

    expect(handleSubmit).toBeCalledWith({
      email: 'example@email.com',
      password: 'superSafePassw0rd',
      nested: {
        things: 'some nested value'
      }
    });
  });
});
