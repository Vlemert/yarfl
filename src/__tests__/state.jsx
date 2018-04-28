import React from 'react';
import TestRenderer from 'react-test-renderer';

import { noop, nullRender } from './util';
import Yarfl from '../index';

describe('Yarfl.State', () => {
  test('provides the state of the form on render', () => {
    const renderState = jest.fn(nullRender);

    TestRenderer.create(
      <Yarfl.Form onSubmit={noop}>
        {() => <Yarfl.State>{renderState}</Yarfl.State>}
      </Yarfl.Form>
    );

    expect(renderState.mock.calls.length).toBe(1);
    const stateArgs = renderState.mock.calls[0][0];
    expect(stateArgs.error).toBeUndefined();
  });

  test('re-renders if validation fails on field registration', async () => {
    const renderState = jest.fn(nullRender);

    TestRenderer.create(
      <Yarfl.Form onSubmit={noop}>
        {() => (
          <React.Fragment>
            <Yarfl.Field name="email" validate={() => 'error'}>
              {nullRender}
            </Yarfl.Field>
            <Yarfl.State>{renderState}</Yarfl.State>
          </React.Fragment>
        )}
      </Yarfl.Form>
    );

    expect(renderState.mock.calls.length).toBe(2);
    expect(renderState.mock.calls[1][0].valid).toBe(false);
    expect(renderState.mock.calls[1][0].invalid).toBe(true);
  });

  test('re-renders if validation fails on field change', async () => {
    const validateEmail = jest.fn(noop);
    const renderEmail = jest.fn(nullRender);
    const renderState = jest.fn(nullRender);

    TestRenderer.create(
      <Yarfl.Form onSubmit={noop}>
        {() => (
          <React.Fragment>
            <Yarfl.Field name="email" validate={validateEmail}>
              {renderEmail}
            </Yarfl.Field>
            <Yarfl.State>{renderState}</Yarfl.State>
          </React.Fragment>
        )}
      </Yarfl.Form>
    );

    validateEmail.mockImplementationOnce(() => 'error');
    renderEmail.mock.calls[0][0].input.onChange('');

    expect(renderState.mock.calls.length).toBe(2);
    expect(renderState.mock.calls[1][0].valid).toBe(false);
    expect(renderState.mock.calls[1][0].invalid).toBe(true);
  });

  test("doesn't re-render if validation fails when already invalid", async () => {
    const renderEmail = jest.fn(nullRender);
    const renderState = jest.fn(nullRender);

    TestRenderer.create(
      <Yarfl.Form onSubmit={noop}>
        {() => (
          <React.Fragment>
            <Yarfl.Field name="email" validate={() => 'error'}>
              {renderEmail}
            </Yarfl.Field>
            <Yarfl.State>{renderState}</Yarfl.State>
          </React.Fragment>
        )}
      </Yarfl.Form>
    );

    expect(renderState.mock.calls.length).toBe(2);
    expect(renderState.mock.calls[1][0].valid).toBe(false);
    expect(renderState.mock.calls[1][0].invalid).toBe(true);

    renderEmail.mock.calls[0][0].input.onChange('');
    expect(renderState.mock.calls.length).toBe(2);
  });

  test('re-renders on form submit (sync onSubmit)', async () => {
    const renderState = jest.fn(nullRender);
    const renderForm = jest.fn(() => (
      <React.Fragment>
        <Yarfl.Field name="email">{nullRender}</Yarfl.Field>
        <Yarfl.State>{renderState}</Yarfl.State>
      </React.Fragment>
    ));

    TestRenderer.create(<Yarfl.Form onSubmit={noop}>{renderForm}</Yarfl.Form>);

    expect(renderState.mock.calls.length).toBe(1);
    const formArgs = renderForm.mock.calls[0][0];
    formArgs.submit({
      preventDefault: noop
    });

    expect(renderState.mock.calls.length).toBe(3);
    expect(renderState.mock.calls[1][0].submitting).toBe(true);
    expect(renderState.mock.calls[2][0].submitting).toBe(false);
  });

  test('re-renders on form submit (async onSubmit)', async () => {
    const renderState = jest.fn(nullRender);
    const renderForm = jest.fn(() => (
      <React.Fragment>
        <Yarfl.Field name="email">{nullRender}</Yarfl.Field>
        <Yarfl.State>{renderState}</Yarfl.State>
      </React.Fragment>
    ));

    TestRenderer.create(
      <Yarfl.Form onSubmit={() => Promise.resolve()}>{renderForm}</Yarfl.Form>
    );

    expect(renderState.mock.calls.length).toBe(1);
    const formArgs = renderForm.mock.calls[0][0];
    formArgs.submit({
      preventDefault: noop
    });

    expect(renderState.mock.calls.length).toBe(2);
    expect(renderState.mock.calls[1][0].submitting).toBe(true);

    await new Promise(setImmediate);

    expect(renderState.mock.calls.length).toBe(3);
    expect(renderState.mock.calls[2][0].submitting).toBe(false);
  });

  test('re-renders when a form fails to submit (rejected promise)', async () => {
    const renderForm = jest.fn(() => <Yarfl.State>{renderState}</Yarfl.State>);
    const renderState = jest.fn(nullRender);

    TestRenderer.create(
      <Yarfl.Form onSubmit={() => Promise.reject('test error')}>
        {renderForm}
      </Yarfl.Form>
    );

    const formArgs = renderForm.mock.calls[0][0];
    formArgs.submit({
      preventDefault: noop
    });

    expect(renderState.mock.calls.length).toBe(2);

    await new Promise(setImmediate);

    expect(renderState.mock.calls.length).toBe(3);
    const stateArgs = renderState.mock.calls[2][0];
    expect(stateArgs.error).toBe('test error');
  });

  test('re-renders when a form fails to submit (thrown error)', async () => {
    const renderForm = jest.fn(() => <Yarfl.State>{renderState}</Yarfl.State>);
    const renderState = jest.fn(nullRender);

    TestRenderer.create(
      <Yarfl.Form
        onSubmit={() => {
          throw 'test error';
        }}
      >
        {renderForm}
      </Yarfl.Form>
    );

    const formArgs = renderForm.mock.calls[0][0];
    formArgs.submit({
      preventDefault: noop
    });

    // TODO: we could possibly make this 2 renders if we don't set submitting to
    // true if the submit result is sync
    expect(renderState.mock.calls.length).toBe(3);
    const stateArgs = renderState.mock.calls[2][0];
    expect(stateArgs.error).toBe('test error');

    // This is here to make sure that we're not accidentally updating the state
    // to 'success' on the next tick
    await new Promise(setImmediate);
    expect(renderState.mock.calls.length).toBe(3);
  });

  test("doesn't re-render if validation fails on submit", async () => {
    const renderState = jest.fn(nullRender);
    const renderForm = jest.fn(() => (
      <React.Fragment>
        <Yarfl.Field name="email" validate={() => 'error'}>
          {nullRender}
        </Yarfl.Field>
        <Yarfl.State>{renderState}</Yarfl.State>
      </React.Fragment>
    ));

    TestRenderer.create(<Yarfl.Form onSubmit={noop}>{renderForm}</Yarfl.Form>);

    expect(renderState.mock.calls.length).toBe(2);

    const formArgs = renderForm.mock.calls[0][0];
    formArgs.submit({
      preventDefault: noop
    });

    expect(renderState.mock.calls.length).toBe(2);
  });

  test('re-renders if a field changes', () => {
    const renderField = jest.fn(nullRender);
    const renderState = jest.fn(nullRender);

    TestRenderer.create(
      <Yarfl.Form onSubmit={noop}>
        {() => (
          <React.Fragment>
            <Yarfl.Field name="email">{renderField}</Yarfl.Field>
            <Yarfl.State>{renderState}</Yarfl.State>
          </React.Fragment>
        )}
      </Yarfl.Form>
    );

    renderField.mock.calls[0][0].input.onChange('changed text');

    expect(renderState.mock.calls.length).toBe(2);
    expect(renderState.mock.calls[1][0].dirty).toBe(true);
    expect(renderState.mock.calls[1][0].pristine).toBe(false);

    renderField.mock.calls[0][0].input.onChange('');
    expect(renderState.mock.calls.length).toBe(3);
    expect(renderState.mock.calls[2][0].dirty).toBe(false);
    expect(renderState.mock.calls[2][0].pristine).toBe(true);
  });

  test("doesn't re-render if a field changes when already dirty", () => {
    const renderField = jest.fn(nullRender);
    const renderState = jest.fn(nullRender);

    TestRenderer.create(
      <Yarfl.Form onSubmit={noop}>
        {() => (
          <React.Fragment>
            <Yarfl.Field name="email">{renderField}</Yarfl.Field>
            <Yarfl.State>{renderState}</Yarfl.State>
          </React.Fragment>
        )}
      </Yarfl.Form>
    );

    renderField.mock.calls[0][0].input.onChange('changed text');

    expect(renderState.mock.calls.length).toBe(2);

    renderField.mock.calls[0][0].input.onChange('other text');

    expect(renderState.mock.calls.length).toBe(2);
  });
});
