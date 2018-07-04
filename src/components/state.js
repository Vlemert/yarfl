import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';

import Context from './context';

class State extends React.Component {
  memoizedRender = memoize((render, props) => render(props));

  render() {
    const { children } = this.props;

    return (
      <Context.Consumer>
        {({ formState }) => this.memoizedRender(children, formState)}
      </Context.Consumer>
    );
  }
}

State.propTypes = {
  children: PropTypes.func.isRequired
};

export default State;
