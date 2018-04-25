import React from 'react';
import PropTypes from 'prop-types';

import FormRenderer from './form-renderer';
import Context from './context';

const State = ({ children }) => (
  <Context.Consumer>
    {({ formState }) => {
      return (
        <FormRenderer
          render={children}
          props={formState}
          trigger={formState}
        />
      );
    }}
  </Context.Consumer>
);

State.propTypes = {
  children: PropTypes.func.isRequired
};

export default State;
