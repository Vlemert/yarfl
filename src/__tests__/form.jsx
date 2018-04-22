import React from 'react';
import TestRenderer from 'react-test-renderer';

import Yarfl from '../index';

describe('Yarfl', () => {
  test('basic submit', () => {
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

    expect(handleSubmit).toBeCalled();
    expect(e.preventDefault).toBeCalled();
  });
});
