import React from 'react';
import PropTypes from 'prop-types';

import FormRenderer from './form-renderer';
import Context from './context';

const State = ({ children }) => (
  <Context.Consumer>
    {({ error }) => (
      <FormRenderer render={children} props={{ error }} trigger={error} />
    )}
  </Context.Consumer>
);

State.propTypes = {
  children: PropTypes.func.isRequired
};

export default State;
