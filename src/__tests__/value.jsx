import React from 'react';
import TestRenderer from 'react-test-renderer';

import { noop, nullRender } from './util';
import Yarfl from '../index';

describe('Yarfl.Value', () => {
  jest.useFakeTimers();

  test('', async () => {
    const renderFirstName = jest.fn(nullRender);
    const renderFirstNameValue = jest.fn(nullRender);

    TestRenderer.create(
      <Yarfl.Form onSubmit={noop}>
        {() => (
          <React.Fragment>
            <Yarfl.Field name="firstName">{renderFirstName}</Yarfl.Field>
            <Yarfl.Value name="firstName">{renderFirstNameValue}</Yarfl.Value>
          </React.Fragment>
        )}
      </Yarfl.Form>
    );

    expect(renderFirstNameValue.mock.calls.length).toBe(1);
    expect(renderFirstNameValue.mock.calls[0][0].value).toBe('');

    jest.advanceTimersByTime(100);
    await new Promise(setImmediate);

    expect(renderFirstNameValue.mock.calls.length).toBe(1);

    renderFirstName.mock.calls[0][0].input.onChange('t');
    renderFirstName.mock.calls[0][0].input.onChange('te');
    renderFirstName.mock.calls[0][0].input.onChange('tes');
    renderFirstName.mock.calls[0][0].input.onChange('test');
    expect(renderFirstNameValue.mock.calls.length).toBe(1);

    jest.advanceTimersByTime(100);
    await new Promise(setImmediate);
    expect(renderFirstNameValue.mock.calls.length).toBe(2);
    expect(renderFirstNameValue.mock.calls[1][0].value).toBe('test');
  });
});
