import React from 'react';
import TestRenderer from 'react-test-renderer';

import { noop, nullRender } from './util';
import Yarfl from '../index';

describe('Yarfl.FieldArray', () => {
  test('', () => {
    TestRenderer.create(
      <Yarfl.Form onSubmit={noop}>
        {() => (
          <Yarfl.FieldArray name="friends">
            {({ insert, append, items, renderItems }) => (
              <React.Fragment>
                {renderItems(({ item, index, remove }) => (
                  <React.Fragment>
                    <Yarfl.Field name="firstName">{() => null}</Yarfl.Field>
                    <Yarfl.Field name="lastName">{() => null}</Yarfl.Field>
                    <button onClick={() => remove()}>delete friend</button>
                  </React.Fragment>
                ))}
                <button onClick={() => append({ firstName: '', lastName: '' })}>
                  add friend
                </button>
              </React.Fragment>
            )}
          </Yarfl.FieldArray>
        )}
      </Yarfl.Form>
    );

    const renderFirstName = jest.fn(nullRender);
    const renderLastName = jest.fn(nullRender);
    const renderFriend = jest.fn(({ item, index, remove }) => (
      <React.Fragment>
        <Yarfl.Field name="firstName">{renderFirstName}</Yarfl.Field>
        <Yarfl.Field name="lastName">{renderLastName}</Yarfl.Field>
        <button onClick={() => remove()}>delete friend</button>
      </React.Fragment>
    ));
    const renderFriends = jest.fn(({ insert, append, items, renderItems }) => (
      <React.Fragment>
        {renderItems(renderFriend)}
        <button onClick={() => append({ firstName: '', lastName: '' })}>
          add friend
        </button>
      </React.Fragment>
    ));

    TestRenderer.create(
      <Yarfl.Form onSubmit={noop}>
        {() => (
          <Yarfl.FieldArray name="friends">{renderFriends}</Yarfl.FieldArray>
        )}
      </Yarfl.Form>
    );
    expect(renderFriends.mock.calls.length).toBe(1);
    expect(renderFriend.mock.calls.length).toBe(0);
    expect(renderFriends.mock.calls[0][0].items).toEqual([]);

    const item1 = {
      firstName: 'test first name',
      lastName: 'test last name'
    };
    renderFriends.mock.calls[0][0].append(item1);
    // TODO: this could theoretically be reduced to 2 if we avoid extra renders
    // by doing a deep equal check in FieldArray
    expect(renderFriends.mock.calls.length).toBe(3);
    expect(renderFriends.mock.calls[1][0].items).toEqual([item1]);
    expect(renderFriends.mock.calls[2][0].items).toEqual([item1]);
    expect(renderFriends.mock.calls[1][0].items).toBe(
      renderFriends.mock.calls[2][0].items
    );
    expect(renderFirstName.mock.calls.length).toBe(1);
    expect(renderLastName.mock.calls.length).toBe(1);
    expect(renderFirstName.mock.calls[0][0].input.value).toBe(
      'test first name'
    );
    expect(renderLastName.mock.calls[0][0].input.value).toBe('test last name');
  });
});
