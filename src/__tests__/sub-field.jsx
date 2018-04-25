import React from 'react';
import TestRenderer from 'react-test-renderer';

import { noop, nullRender } from './util';
import Yarfl from '../index';

describe('Yarfl.SubField', () => {
  test('groups the values of multiple fields together', () => {
    const renderStreetName = jest.fn(nullRender);
    const renderStreetNumber = jest.fn(nullRender);
    const renderZip = jest.fn(nullRender);
    const renderForm = jest.fn(() => (
      <Yarfl.SubField name="address">
        <Yarfl.SubField name="street">
          <Yarfl.Field name="name">{renderStreetName}</Yarfl.Field>
          <Yarfl.Field name="number">{renderStreetNumber}</Yarfl.Field>
        </Yarfl.SubField>
        <Yarfl.Field name="zip">{renderZip}</Yarfl.Field>
      </Yarfl.SubField>
    ));
    const handleSubmit = jest.fn();

    TestRenderer.create(
      <Yarfl.Form onSubmit={handleSubmit}>{renderForm}</Yarfl.Form>
    );

    renderStreetName.mock.calls[0][0].input.onChange('some street');
    expect(renderStreetName.mock.calls.length).toBe(2);
    expect(renderStreetNumber.mock.calls.length).toBe(1);
    expect(renderZip.mock.calls.length).toBe(1);

    renderStreetNumber.mock.calls[0][0].input.onChange('1234');
    expect(renderStreetName.mock.calls.length).toBe(2);
    expect(renderStreetNumber.mock.calls.length).toBe(2);
    expect(renderZip.mock.calls.length).toBe(1);

    renderZip.mock.calls[0][0].input.onChange('test zip');
    expect(renderStreetName.mock.calls.length).toBe(2);
    expect(renderStreetNumber.mock.calls.length).toBe(2);
    expect(renderZip.mock.calls.length).toBe(2);

    renderForm.mock.calls[0][0].submit({
      preventDefault: noop
    });
    expect(handleSubmit).toBeCalledWith({
      address: {
        street: {
          name: 'some street',
          number: '1234'
        },
        zip: 'test zip'
      }
    });
  });

  test('allows lower fields to track their own states', () => {
    const renderStreet = jest.fn(nullRender);
    const renderZip = jest.fn(nullRender);

    TestRenderer.create(
      <Yarfl.Form onSubmit={noop}>
        {() => (
          <Yarfl.SubField name="address">
            <Yarfl.Field name="street">{renderStreet}</Yarfl.Field>
            <Yarfl.Field name="zip">{renderZip}</Yarfl.Field>
          </Yarfl.SubField>
        )}
      </Yarfl.Form>
    );

    expect(renderStreet.mock.calls.length).toBe(1);
    expect(renderZip.mock.calls.length).toBe(1);

    renderStreet.mock.calls[0][0].input.onFocus();
    expect(renderStreet.mock.calls.length).toBe(2);
    expect(renderZip.mock.calls.length).toBe(1);
    expect(renderStreet.mock.calls[1][0].active).toBe(true);

    renderStreet.mock.calls[1][0].input.onBlur('');
    expect(renderStreet.mock.calls.length).toBe(3);
    expect(renderZip.mock.calls.length).toBe(1);
    expect(renderStreet.mock.calls[2][0].active).toBe(false);
  });
});
