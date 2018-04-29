import React from 'react';
import PropTypes from 'prop-types';

import { defaultFieldState } from '../state/index';
import FieldRenderer from './field-renderer';
import Context from './context';

class Field extends React.Component {
  render() {
    const {
      name,
      validate,
      initialValue: initialValueFromField,
      parse,
      format,
      children
    } = this.props;

    return (
      <Context.Consumer>
        {({
          functions: {
            registerField,
            changeField,
            focusField,
            blurField,
            reinitializeField
          },
          initialValues,
          enableReinitialize,
          fields,
          values,
          initial
        }) => {
          const field = fields[name] || defaultFieldState;

          const initialValueFromForm = initialValues && initialValues[name];
          const initialValueFromState = initial[name];

          let liveInitialValue;
          if (initialValueFromForm !== undefined) {
            liveInitialValue = initialValueFromForm;
          } else if (initialValueFromField !== undefined) {
            liveInitialValue = initialValueFromField;
          }

          let initialValue;
          if (initialValueFromState !== undefined) {
            initialValue = initialValueFromState;
          } else if (liveInitialValue !== undefined) {
            initialValue = liveInitialValue;
          } else {
            initialValue = '';
          }

          const valueFromState = values[name];
          let value;
          if (valueFromState !== undefined) {
            value = valueFromState;
          } else {
            value = initialValue;
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
              value={value}
              enableReinitialize={enableReinitialize}
              initialValue={initialValue}
              liveInitialValue={liveInitialValue}
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
