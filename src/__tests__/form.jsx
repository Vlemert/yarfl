import React from 'react';
import TestRenderer from 'react-test-renderer';

import { noop, nullRender } from './util';
import Yarfl from '../index';

const consoleError = console.error;

describe('Yarfl.Form', () => {
  beforeEach(() => {
    console.error = e => {
      throw e;
    };
  });

  afterEach(() => {
    console.error = consoleError;
  });

  test('renders the right content', () => {
    const render = () => 'form!';
    const root = TestRenderer.create(
      <Yarfl.Form onSubmit={noop}>{render}</Yarfl.Form>
    );

    expect(root.toJSON()).toBe('form!');
  });

  test("doesn't block renders when the render function changes", () => {
    const App = ({ text }) => (
      <Yarfl.Form onSubmit={noop}>{() => text}</Yarfl.Form>
    );
    const root = TestRenderer.create(<App text="before" />);

    expect(root.toJSON()).toBe('before');

    root.update(<App text="after" />);
    expect(root.toJSON()).toBe('after');
  });

  test('handles basic submit', () => {
    const render = jest.fn(nullRender);
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
    const renderEmail = jest.fn(nullRender);
    const renderPassword = jest.fn(nullRender);
    const renderThings = jest.fn(nullRender);
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

    renderEmail.mock.calls[0][0].input.onChange('example@email.com');
    renderPassword.mock.calls[0][0].input.onChange('superSafePassw0rd');
    renderThings.mock.calls[0][0].input.onChange('some nested value');
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

  test('calls onSubmitSuccess with the submit result (sync)', () => {
    const renderForm = jest.fn(nullRender);
    const handleSubmit = jest.fn(() => 'submit result');
    const handleSubmitSuccess = jest.fn();

    TestRenderer.create(
      <Yarfl.Form onSubmit={handleSubmit} onSubmitSuccess={handleSubmitSuccess}>
        {renderForm}
      </Yarfl.Form>
    );

    const e = {
      preventDefault: jest.fn()
    };
    renderForm.mock.calls[0][0].submit(e);

    expect(handleSubmitSuccess.mock.calls.length).toBe(1);
    expect(handleSubmitSuccess).toBeCalledWith('submit result');
  });

  test('calls onSubmitSuccess with the submit result (async)', async () => {
    const renderForm = jest.fn(nullRender);
    const handleSubmit = jest.fn(() => Promise.resolve('submit result'));
    const handleSubmitSuccess = jest.fn();

    TestRenderer.create(
      <Yarfl.Form onSubmit={handleSubmit} onSubmitSuccess={handleSubmitSuccess}>
        {renderForm}
      </Yarfl.Form>
    );

    const e = {
      preventDefault: jest.fn()
    };
    renderForm.mock.calls[0][0].submit(e);

    expect(handleSubmitSuccess.mock.calls.length).toBe(0);
    await new Promise(setImmediate);
    expect(handleSubmitSuccess.mock.calls.length).toBe(1);
    expect(handleSubmitSuccess).toBeCalledWith('submit result');
  });

  test('calls onSubmitFail with the submit error (sync)', () => {
    const renderForm = jest.fn(nullRender);
    const handleSubmit = jest.fn(() => {
      throw 'submit error';
    });
    const handleSubmitFail = jest.fn();

    TestRenderer.create(
      <Yarfl.Form onSubmit={handleSubmit} onSubmitFail={handleSubmitFail}>
        {renderForm}
      </Yarfl.Form>
    );

    const e = {
      preventDefault: jest.fn()
    };
    renderForm.mock.calls[0][0].submit(e);

    expect(handleSubmitFail.mock.calls.length).toBe(1);
    expect(handleSubmitFail).toBeCalledWith('submit error');
  });

  test('calls onSubmitFail with the submit error (async)', async () => {
    const renderForm = jest.fn(nullRender);
    const handleSubmit = jest.fn(() => Promise.reject('submit error'));
    const handleSubmitFail = jest.fn();

    TestRenderer.create(
      <Yarfl.Form onSubmit={handleSubmit} onSubmitFail={handleSubmitFail}>
        {renderForm}
      </Yarfl.Form>
    );

    const e = {
      preventDefault: jest.fn()
    };
    renderForm.mock.calls[0][0].submit(e);

    expect(handleSubmitFail.mock.calls.length).toBe(0);
    await new Promise(setImmediate);
    expect(handleSubmitFail.mock.calls.length).toBe(1);
    expect(handleSubmitFail).toBeCalledWith('submit error');
  });

  test("doesn't set state after unmounting", async () => {
    const renderForm = jest.fn(nullRender);

    const root = TestRenderer.create(
      <Yarfl.Form onSubmit={() => Promise.resolve()}>{renderForm}</Yarfl.Form>
    );

    const formArgs = renderForm.mock.calls[0][0];
    formArgs.submit({
      preventDefault: noop
    });

    root.unmount();

    await new Promise(setImmediate);
  });
});
