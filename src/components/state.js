import React from 'react';

import FormRenderer from './form-renderer';

const createStateComponent = Context => {
  const State = ({ children }) => (
    <Context.Consumer>
      {({ error }) => (
        <FormRenderer render={children} props={{ error }} trigger={error} />
      )}
    </Context.Consumer>
  );

  return State;
};

export default createStateComponent;
