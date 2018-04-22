import React from 'react';

import { defaultFieldState } from '../state/index';
import FieldRenderer from './field-renderer';

const createFieldComponent = Context => {
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

  return Field;
};

export default createFieldComponent;
