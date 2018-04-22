import React from 'react';
import PropTypes from 'prop-types';

import { defaultFieldState } from '../state/index';
import FieldRenderer from './field-renderer';
import Context from './context';

class Field extends React.Component {
  render() {
    const { name, validate, children } = this.props;

    return (
      <Context.Consumer>
        {({
          functions: { registerField, changeField, focusField, blurField },
          fields
        }) => {
          const field = fields[name] || defaultFieldState;

          return (
            <FieldRenderer
              name={name}
              render={children}
              validate={validate}
              registerField={registerField}
              changeField={changeField}
              focusField={focusField}
              blurField={blurField}
              field={field}
            />
          );
        }}
      </Context.Consumer>
    );
  }
}

Field.propTypes = {
  name: PropTypes.string.isRequired,
  children: PropTypes.func.isRequired,
  validate: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.func),
    PropTypes.func
  ])
};

export default Field;
