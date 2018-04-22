import React from 'react';
import TestRenderer from 'react-test-renderer';

import Yarfl from '../index';

describe('Yarfl.State', () => {
  test('provides the state of the form on render', () => {
    const renderState = jest.fn(() => null);

    TestRenderer.create(
      <Yarfl.Form>{() => <Yarfl.State>{renderState}</Yarfl.State>}</Yarfl.Form>
    );

    expect(renderState.mock.calls.length).toBe(1);
    const stateArgs = renderState.mock.calls[0][0];
    expect(stateArgs.error).toBeUndefined();
  });

  test('rerenders when a form fails to submit (rejected promise)', async () => {
    const renderForm = jest.fn(() => <Yarfl.State>{renderState}</Yarfl.State>);
    const renderState = jest.fn(() => null);

    TestRenderer.create(
      <Yarfl.Form onSubmit={() => Promise.reject('test error')}>
        {renderForm}
      </Yarfl.Form>
    );

    const formArgs = renderForm.mock.calls[0][0];
    formArgs.submit({
      preventDefault: () => {}
    });

    await new Promise(setImmediate);

    expect(renderState.mock.calls.length).toBe(2);
    const stateArgs = renderState.mock.calls[1][0];
    expect(stateArgs.error).toBe('test error');
  });

  test('rerenders when a form fails to submit (thrown error)', async () => {
    const renderForm = jest.fn(() => <Yarfl.State>{renderState}</Yarfl.State>);
    const renderState = jest.fn(() => null);

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
      preventDefault: () => {}
    });

    await new Promise(setImmediate);

    expect(renderState.mock.calls.length).toBe(2);
    const stateArgs = renderState.mock.calls[1][0];
    expect(stateArgs.error).toBe('test error');
  });

  test("doesn't rerender if validation fails on submit", async () => {
    const renderState = jest.fn(() => null);
    const renderForm = jest.fn(() => (
      <React.Fragment>
        <Yarfl.Field name="email" validate={() => 'error'}>
          {() => null}
        </Yarfl.Field>
        <Yarfl.State>{renderState}</Yarfl.State>
      </React.Fragment>
    ));

    TestRenderer.create(<Yarfl.Form>{renderForm}</Yarfl.Form>);

    const formArgs = renderForm.mock.calls[0][0];
    formArgs.submit({
      preventDefault: () => {}
    });

    expect(renderState.mock.calls.length).toBe(1);
  });

  test("doesn't rerender if a field changes", () => {
    const renderField = jest.fn(() => null);
    const renderState = jest.fn(() => null);

    TestRenderer.create(
      <Yarfl.Form>
        {() => (
          <React.Fragment>
            <Yarfl.Field name="email">{renderField}</Yarfl.Field>
            <Yarfl.State>{renderState}</Yarfl.State>
          </React.Fragment>
        )}
      </Yarfl.Form>
    );

    renderField.mock.calls[0][0].input.onChange({
      target: {
        value: 'changed text'
      }
    });

    expect(renderState.mock.calls.length).toBe(1);
  });
});
