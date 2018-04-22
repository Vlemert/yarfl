import React from 'react';
import TestRenderer from 'react-test-renderer';

import Yarfl from '../index';

describe('Yarfl.Form', () => {
  test('renders the right content', () => {
    const render = () => 'form!';
    const root = TestRenderer.create(<Yarfl.Form>{render}</Yarfl.Form>);

    expect(root.toJSON()).toBe('form!');
  });

  test("doesn't block renders when the render function changes", () => {
    const App = ({ text }) => <Yarfl.Form>{() => text}</Yarfl.Form>;
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

    expect(handleSubmit).toBeCalled();
    expect(e.preventDefault).toBeCalled();
    expect(render.mock.calls.length).toBe(1);
  });
});
