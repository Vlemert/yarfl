import React from 'react';
import TestRenderer from 'react-test-renderer';

import Yarfl from '../index';

describe('Yarfl', () => {
  test('basic submit', () => {
    const render = jest.fn(() => null);
    const handleSubmit = jest.fn();

    const root = TestRenderer.create(
      <Yarfl.Form onSubmit={handleSubmit}>{render}</Yarfl.Form>
    );

    expect(handleSubmit).not.toBeCalled();

    const e = {
      preventDefault: jest.fn()
    };
    render.mock.calls[0][0].submit(e);

    expect(handleSubmit).toBeCalled();
    expect(e.preventDefault).toBeCalled();
  });

  describe('Field', () => {
    describe('on initialization', () => {
      test('gets the right value', () => {
        const renderEmail = jest.fn(() => null);
        const renderPassword = jest.fn(() => null);

        TestRenderer.create(
          <Yarfl.Form>
            {({}) => (
              <React.Fragment>
                <Yarfl.Field name="email">{renderEmail}</Yarfl.Field>
                <Yarfl.Field name="password">{renderPassword}</Yarfl.Field>
              </React.Fragment>
            )}
          </Yarfl.Form>
        );

        expect(renderEmail.mock.calls.length).toBe(1);
        const emailArgs = renderEmail.mock.calls[0][0];
        expect(emailArgs.input.name).toBe('email');
        expect(emailArgs.input.value).toBe('');
        expect(emailArgs.error).toBe(undefined);
        expect(emailArgs.active).toBe(false);
        expect(emailArgs.invalid).toBe(false);
        expect(emailArgs.valid).toBe(true);
        expect(emailArgs.touched).toBe(false);
        expect(emailArgs.dirty).toBe(false);
        expect(emailArgs.pristine).toBe(true);

        expect(renderPassword.mock.calls.length).toBe(1);
        const passwordArgs = renderPassword.mock.calls[0][0];
        expect(passwordArgs.input.name).toBe('password');
        expect(passwordArgs.input.value).toBe('');
      });

      test('validates', () => {
        const renderEmail = jest.fn(() => null);
        const renderPassword = jest.fn(() => null);
        const validateEmail = jest.fn();
        const validatePassword = jest.fn(() => 'test error');

        TestRenderer.create(
          <Yarfl.Form>
            {({}) => (
              <React.Fragment>
                <Yarfl.Field name="email" validate={validateEmail}>
                  {renderEmail}
                </Yarfl.Field>
                <Yarfl.Field name="password" validate={validatePassword}>
                  {renderPassword}
                </Yarfl.Field>
              </React.Fragment>
            )}
          </Yarfl.Form>
        );

        expect(validateEmail.mock.calls.length).toBe(1);
        expect(validateEmail).toBeCalledWith('');
        expect(renderEmail.mock.calls.length).toBe(1);

        expect(validatePassword.mock.calls.length).toBe(1);
        expect(validatePassword).toBeCalledWith('');
        expect(renderPassword.mock.calls.length).toBe(2);
        const passwordArgs = renderPassword.mock.calls[1][0];
        expect(passwordArgs.error).toBe('test error');
        expect(passwordArgs.valid).toBe(false);
        expect(passwordArgs.invalid).toBe(true);
      });
    });

    describe('onChange', () => {
      test('handled and causes rerender', () => {
        const renderEmail = jest.fn(() => null);

        TestRenderer.create(
          <Yarfl.Form>
            {({}) => (
              <React.Fragment>
                <Yarfl.Field name="email">{renderEmail}</Yarfl.Field>
              </React.Fragment>
            )}
          </Yarfl.Form>
        );

        const emailArgs = renderEmail.mock.calls[0][0];
        const emailOnChange = emailArgs.input.onChange;

        emailOnChange({
          target: {
            value: 'changed text'
          }
        });

        expect(renderEmail.mock.calls.length).toBe(2);
        expect(renderEmail.mock.calls[1][0].input.value).toBe('changed text');
        const updatedEmailArgs = renderEmail.mock.calls[1][0];
        expect(updatedEmailArgs.input.onChange).toBe(emailArgs.input.onChange);
        expect(updatedEmailArgs.input.onFocus).toBe(emailArgs.input.onFocus);
        expect(updatedEmailArgs.input.onBlur).toBe(emailArgs.input.onBlur);
      });

      test('causes validate to be called', () => {
        const renderEmail = jest.fn(() => null);
        const validateEmail = jest.fn();

        TestRenderer.create(
          <Yarfl.Form>
            {({}) => (
              <React.Fragment>
                <Yarfl.Field name="email" validate={validateEmail}>
                  {renderEmail}
                </Yarfl.Field>
              </React.Fragment>
            )}
          </Yarfl.Form>
        );

        const emailArgs = renderEmail.mock.calls[0][0];
        const emailOnChange = emailArgs.input.onChange;

        validateEmail.mockImplementationOnce(() => 'test error');
        emailOnChange({
          target: {
            value: 'changed text'
          }
        });

        expect(validateEmail.mock.calls.length).toBe(2);
        expect(validateEmail).toBeCalledWith('changed text');
        const updatedEmailArgs = renderEmail.mock.calls[1][0];
        expect(updatedEmailArgs.error).toBe('test error');
        expect(updatedEmailArgs.valid).toBe(false);
        expect(updatedEmailArgs.invalid).toBe(true);
      });
    });

    describe('onBlur', () => {
      test('handled and causes rerender', () => {
        const renderEmail = jest.fn(() => null);

        TestRenderer.create(
          <Yarfl.Form>
            {({}) => (
              <React.Fragment>
                <Yarfl.Field name="email">{renderEmail}</Yarfl.Field>
              </React.Fragment>
            )}
          </Yarfl.Form>
        );

        const emailArgs = renderEmail.mock.calls[0][0];
        const emailOnBlur = emailArgs.input.onBlur;

        emailOnBlur({
          target: {
            value: 'changed text'
          }
        });

        expect(renderEmail.mock.calls.length).toBe(2);
        expect(renderEmail.mock.calls[1][0].input.value).toBe('changed text');
      });

      test('causes validate to be called', () => {
        const renderEmail = jest.fn(() => null);
        const validateEmail = jest.fn();

        TestRenderer.create(
          <Yarfl.Form>
            {({}) => (
              <React.Fragment>
                <Yarfl.Field name="email" validate={validateEmail}>
                  {renderEmail}
                </Yarfl.Field>
              </React.Fragment>
            )}
          </Yarfl.Form>
        );

        const emailArgs = renderEmail.mock.calls[0][0];
        const emailOnBlur = emailArgs.input.onBlur;

        validateEmail.mockImplementationOnce(() => 'test error');
        emailOnBlur({
          target: {
            value: 'changed text'
          }
        });

        expect(validateEmail.mock.calls.length).toBe(2);
        expect(validateEmail).toBeCalledWith('changed text');
        const updatedEmailArgs = renderEmail.mock.calls[1][0];
        expect(updatedEmailArgs.error).toBe('test error');
        expect(updatedEmailArgs.valid).toBe(false);
        expect(updatedEmailArgs.invalid).toBe(true);
      });
    });
  });
});
