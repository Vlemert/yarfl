import React from 'react';
import PropTypes from 'prop-types';

import { defaultFieldState } from '../state/index';
import FieldRenderer from './field-renderer';
import Context from './context';

class Field extends React.Component {
  render() {
    const { name, validate, initialValue, parse, format, children } = this.props;

    return (
      <Context.Consumer>
        {({
          functions: { registerField, changeField, focusField, blurField, reinitializeField },
          initialValues,
          enableReinitialize,
          fields
        }) => {
          let field = fields[name];

          const initialValueFromForm = initialValues && initialValues[name];
          const actualInitialValue =
            initialValueFromForm !== undefined
              ? initialValueFromForm
              : initialValue;

          if (!field) {
            if (actualInitialValue !== undefined && actualInitialValue !== '') {
              field = {
                ...defaultFieldState,
                value: actualInitialValue
              };
            } else {
              field = defaultFieldState;
            }
          }

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
              enableReinitialize={enableReinitialize}
              initialValue={actualInitialValue}
              reinitializeField={reinitializeField}
              parse={parse}
              format={format}
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
  ]),
  initialValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool
  ]),
  parse: PropTypes.func,
  format: PropTypes.func
};

export default Field;
