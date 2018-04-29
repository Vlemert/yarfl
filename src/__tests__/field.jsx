import React from 'react';
import TestRenderer from 'react-test-renderer';

import { noop, nullRender } from './util';
import Yarfl from '../index';

describe('Yarfl.Field', () => {
  describe('on initialization', () => {
    test('gets the right value', () => {
      const renderEmail = jest.fn(nullRender);
      const renderPassword = jest.fn(nullRender);
      const renderRemember = jest.fn(nullRender);
      const renderName = jest.fn(nullRender);

      TestRenderer.create(
        <Yarfl.Form
          onSubmit={noop}
          initialValues={{
            name: 'Sherlock'
          }}
        >
          {({}) => (
            <React.Fragment>
              <Yarfl.Field name="email">{renderEmail}</Yarfl.Field>
              <Yarfl.Field name="password" initialValue="">
                {renderPassword}
              </Yarfl.Field>
              <Yarfl.Field name="remember" initialValue="yes">
                {renderRemember}
              </Yarfl.Field>
              <Yarfl.Field name="name">{renderName}</Yarfl.Field>
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
      expect(emailArgs.initialValue).toBe('');
      expect(emailArgs.dirty).toBe(false);

      expect(renderPassword.mock.calls.length).toBe(1);
      const passwordArgs = renderPassword.mock.calls[0][0];
      expect(passwordArgs.input.name).toBe('password');
      expect(passwordArgs.input.value).toBe('');

      expect(renderRemember.mock.calls.length).toBe(1);
      const rememberArgs = renderRemember.mock.calls[0][0];
      expect(rememberArgs.input.name).toBe('remember');
      expect(rememberArgs.input.value).toBe('yes');
      expect(rememberArgs.initialValue).toBe('yes');

      expect(renderName.mock.calls.length).toBe(1);
      const nameArgs = renderName.mock.calls[0][0];
      expect(nameArgs.input.name).toBe('name');
      expect(nameArgs.input.value).toBe('Sherlock');
      expect(nameArgs.initialValue).toBe('Sherlock');
    });

    test('validates', () => {
      const renderEmail = jest.fn(nullRender);
      const renderPassword = jest.fn(nullRender);
      const validateEmail = jest.fn();
      const validatePassword = jest.fn(() => 'test error');

      TestRenderer.create(
        <Yarfl.Form onSubmit={noop}>
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

    describe('if a field with the same name already exists', () => {
      test("does't reinitialize the value", () => {
        const renderEmail = jest.fn(nullRender);
        const App = ({ renderTwice, renderThreeTimes }) => (
          <Yarfl.Form onSubmit={noop}>
            {({}) => (
              <React.Fragment>
                <Yarfl.Field name="email">{renderEmail}</Yarfl.Field>
                {renderTwice && (
                  <Yarfl.Field name="email">{nullRender}</Yarfl.Field>
                )}
                {renderThreeTimes && (
                  <Yarfl.Field name="email" initialValue="some third value">
                    {nullRender}
                  </Yarfl.Field>
                )}
              </React.Fragment>
            )}
          </Yarfl.Form>
        );

        const root = TestRenderer.create(<App />);

        expect(renderEmail.mock.calls.length).toBe(1);
        renderEmail.mock.calls[0][0].input.onChange('some other value');
        expect(renderEmail.mock.calls.length).toBe(2);
        expect(renderEmail.mock.calls[1][0].input.value).toBe(
          'some other value'
        );

        root.update(<App renderTwice />);
        expect(renderEmail.mock.calls.length).toBe(2);

        root.update(<App renderTwice renderThreeTimes />);
        expect(renderEmail.mock.calls.length).toBe(2);
      });
    });
  });

  test('enableReinitialize should not cause errors if a field has no initial value', () => {
    TestRenderer.create(
      <Yarfl.Form onSubmit={noop} enableReinitialize>
        {() => <Yarfl.Field name="city">{nullRender}</Yarfl.Field>}
      </Yarfl.Form>
    );
  });

  test('reinitialize', () => {
    const renderName = jest.fn(nullRender);
    const renderStreet = jest.fn(nullRender);
    const renderZip = jest.fn(nullRender);

    const App = ({
      initialValues,
      initialStreet,
      initialZip,
      enableReinitialize
    }) => (
      <Yarfl.Form
        onSubmit={noop}
        initialValues={initialValues}
        enableReinitialize={enableReinitialize}
      >
        {() => (
          <React.Fragment>
            <Yarfl.Field name="name">{renderName}</Yarfl.Field>
            <Yarfl.Field name="street" initialValue={initialStreet}>
              {renderStreet}
            </Yarfl.Field>
            <Yarfl.SubField name="address">
              <Yarfl.Field name="zip" initialValue={initialZip}>
                {renderZip}
              </Yarfl.Field>
            </Yarfl.SubField>
          </React.Fragment>
        )}
      </Yarfl.Form>
    );

    const root = TestRenderer.create(
      <App
        initialValues={{
          name: 'initial name',
          address: {
            zip: 'initial zip'
          }
        }}
        initialStreet="initial street"
      />
    );

    expect(renderName.mock.calls.length).toBe(1);
    expect(renderName.mock.calls[0][0].input.value).toBe('initial name');
    expect(renderStreet.mock.calls.length).toBe(1);
    expect(renderStreet.mock.calls[0][0].input.value).toBe('initial street');
    expect(renderZip.mock.calls.length).toBe(1);
    expect(renderZip.mock.calls[0][0].input.value).toBe('initial zip');

    root.update(
      <App
        initialValues={{
          name: 'other name'
        }}
        initialStreet="other street"
        initialZip="other zip"
        enableReinitialize
      />
    );

    expect(renderName.mock.calls.length).toBe(2);
    expect(renderName.mock.calls[1][0].input.value).toBe('other name');
    expect(renderStreet.mock.calls.length).toBe(2);
    expect(renderStreet.mock.calls[1][0].input.value).toBe('other street');
    expect(renderZip.mock.calls.length).toBe(2);
    expect(renderZip.mock.calls[1][0].input.value).toBe('other zip');

    root.update(
      <App
        initialValues={{
          name: 'other name'
        }}
        initialStreet="other street"
        initialZip="other zip"
        enableReinitialize
      />
    );

    expect(renderName.mock.calls.length).toBe(2);
    expect(renderStreet.mock.calls.length).toBe(2);
    expect(renderZip.mock.calls.length).toBe(2);
  });

  describe('onChange', () => {
    test('handled and causes rerender', () => {
      const renderEmail = jest.fn(nullRender);

      TestRenderer.create(
        <Yarfl.Form onSubmit={noop}>
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
        preventDefault: noop,
        stopPropagation: noop,
        target: {
          value: 'changed text'
        }
      });

      expect(renderEmail.mock.calls.length).toBe(2);
      const updatedEmailArgs = renderEmail.mock.calls[1][0];
      expect(updatedEmailArgs.input.value).toBe('changed text');
      expect(updatedEmailArgs.initialValue).toBe('');
      expect(updatedEmailArgs.dirty).toBe(true);
      expect(updatedEmailArgs.input.onChange).toBe(emailArgs.input.onChange);
      expect(updatedEmailArgs.input.onFocus).toBe(emailArgs.input.onFocus);
      expect(updatedEmailArgs.input.onBlur).toBe(emailArgs.input.onBlur);
    });

    test('causes validate to be called', () => {
      const renderEmail = jest.fn(nullRender);
      const validateEmail = jest.fn();

      TestRenderer.create(
        <Yarfl.Form onSubmit={noop}>
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
      emailOnChange('changed text');

      expect(validateEmail.mock.calls.length).toBe(2);
      expect(validateEmail).toBeCalledWith('changed text');
      const updatedEmailArgs = renderEmail.mock.calls[1][0];
      expect(updatedEmailArgs.error).toBe('test error');
      expect(updatedEmailArgs.valid).toBe(false);
      expect(updatedEmailArgs.invalid).toBe(true);
    });
  });

  describe('onFocus', () => {
    test('handled and causes rerender', () => {
      const renderEmail = jest.fn(nullRender);

      TestRenderer.create(
        <Yarfl.Form onSubmit={noop}>
          {({}) => (
            <React.Fragment>
              <Yarfl.Field name="email">{renderEmail}</Yarfl.Field>
            </React.Fragment>
          )}
        </Yarfl.Form>
      );

      const emailArgs = renderEmail.mock.calls[0][0];
      const emailOnFocus = emailArgs.input.onFocus;

      emailOnFocus();

      expect(renderEmail.mock.calls.length).toBe(2);
      expect(renderEmail.mock.calls[1][0].active).toBe(true);
    });

    test('should not clear values', () => {
      const renderEmail = jest.fn(nullRender);

      TestRenderer.create(
        <Yarfl.Form onSubmit={noop}>
          {({}) => (
            <React.Fragment>
              <Yarfl.Field name="email">{renderEmail}</Yarfl.Field>
            </React.Fragment>
          )}
        </Yarfl.Form>
      );

      const emailArgs = renderEmail.mock.calls[0][0];
      emailArgs.input.onChange('some value');
      emailArgs.input.onFocus();

      expect(renderEmail.mock.calls.length).toBe(3);
      expect(renderEmail.mock.calls[2][0].input.value).toBe('some value');
    });
  });

  describe('onBlur', () => {
    test('handled and causes rerender', () => {
      const renderEmail = jest.fn(nullRender);

      TestRenderer.create(
        <Yarfl.Form onSubmit={noop}>
          {({}) => (
            <React.Fragment>
              <Yarfl.Field name="email">{renderEmail}</Yarfl.Field>
            </React.Fragment>
          )}
        </Yarfl.Form>
      );

      const emailArgs = renderEmail.mock.calls[0][0];

      emailArgs.input.onFocus();
      expect(renderEmail.mock.calls.length).toBe(2);
      emailArgs.input.onBlur({
        preventDefault: noop,
        stopPropagation: noop,
        target: {
          value: 'changed text'
        }
      });

      expect(renderEmail.mock.calls.length).toBe(3);
      expect(renderEmail.mock.calls[2][0].input.value).toBe('changed text');
      expect(renderEmail.mock.calls[2][0].touched).toBe(true);
    });

    test('causes validate to be called', () => {
      const renderEmail = jest.fn(nullRender);
      const validateEmail = jest.fn();

      TestRenderer.create(
        <Yarfl.Form onSubmit={noop}>
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
      emailOnBlur('changed text');

      expect(validateEmail.mock.calls.length).toBe(2);
      expect(validateEmail).toBeCalledWith('changed text');
      const updatedEmailArgs = renderEmail.mock.calls[1][0];
      expect(updatedEmailArgs.error).toBe('test error');
      expect(updatedEmailArgs.valid).toBe(false);
      expect(updatedEmailArgs.invalid).toBe(true);
    });
  });

  describe('validate', () => {
    test('works with an array', () => {
      const renderEmail = jest.fn(nullRender);
      const validateEmail = [jest.fn(), jest.fn()];

      TestRenderer.create(
        <Yarfl.Form onSubmit={noop}>
          {({}) => (
            <React.Fragment>
              <Yarfl.Field name="email" validate={validateEmail}>
                {renderEmail}
              </Yarfl.Field>
            </React.Fragment>
          )}
        </Yarfl.Form>
      );

      expect(validateEmail[0].mock.calls.length).toBe(1);
      expect(validateEmail[1].mock.calls.length).toBe(1);

      const emailArgs = renderEmail.mock.calls[0][0];
      const emailOnChange = emailArgs.input.onChange;

      validateEmail[0].mockImplementationOnce(() => 'test error');
      emailOnChange('changed text');

      expect(validateEmail[0].mock.calls.length).toBe(2);
      expect(validateEmail[1].mock.calls.length).toBe(1);
      expect(validateEmail[0]).toBeCalledWith('changed text');
      const updatedEmailArgs = renderEmail.mock.calls[1][0];
      expect(updatedEmailArgs.error).toBe('test error');
      expect(updatedEmailArgs.valid).toBe(false);
      expect(updatedEmailArgs.invalid).toBe(true);

      validateEmail[1].mockImplementationOnce(() => 'test error 2');
      emailOnChange('new changed text');

      expect(validateEmail[0].mock.calls.length).toBe(3);
      expect(validateEmail[1].mock.calls.length).toBe(2);
      expect(validateEmail[0]).toBeCalledWith('new changed text');
      expect(validateEmail[1]).toBeCalledWith('new changed text');
      const updatedEmailArgs2 = renderEmail.mock.calls[2][0];
      expect(updatedEmailArgs2.error).toBe('test error 2');
      expect(updatedEmailArgs2.valid).toBe(false);
      expect(updatedEmailArgs2.invalid).toBe(true);
    });
  });

  test('format & parse', () => {
    const handleSubmit = jest.fn();
    const renderEmail = jest.fn(nullRender);
    const renderForm = jest.fn(() => (
      <React.Fragment>
        <Yarfl.Field
          name="email"
          initialValue="TEST EMAIL ADDRESS"
          parse={value => value.toUpperCase()}
          format={value => value.toLowerCase()}
        >
          {renderEmail}
        </Yarfl.Field>
      </React.Fragment>
    ));

    TestRenderer.create(
      <Yarfl.Form onSubmit={handleSubmit}>{renderForm}</Yarfl.Form>
    );

    expect(renderEmail.mock.calls[0][0].input.value).toBe('test email address');
    renderForm.mock.calls[0][0].submit({
      preventDefault: noop
    });
    expect(handleSubmit.mock.calls[0][0]).toEqual({
      email: 'TEST EMAIL ADDRESS'
    });

    renderEmail.mock.calls[0][0].input.onChange('test 2');
    expect(renderEmail.mock.calls[2][0].input.value).toBe('test 2');

    renderForm.mock.calls[0][0].submit({
      preventDefault: noop
    });
    expect(handleSubmit.mock.calls[1][0]).toEqual({
      email: 'TEST 2'
    });

    renderEmail.mock.calls[0][0].input.onFocus();
    renderEmail.mock.calls[0][0].input.onBlur('test 3');
    expect(renderEmail.mock.calls[4][0].input.value).toBe('test 3');

    renderForm.mock.calls[0][0].submit({
      preventDefault: noop
    });
    expect(handleSubmit.mock.calls[2][0]).toEqual({
      email: 'TEST 3'
    });
  });
});
