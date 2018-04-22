import React from 'react';

import FormRenderer from './form-renderer';
import Context from './context';

const State = ({ children }) => (
  <Context.Consumer>
    {({ error }) => (
      <FormRenderer render={children} props={{ error }} trigger={error} />
    )}
  </Context.Consumer>
);

export default State;
