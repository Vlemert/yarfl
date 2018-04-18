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
            const onChange = e => {
              // TODO: check here if this is an event or value. Is that possible?
              const value = e.target.value;
              changeField(name, value, validate);
            };

            const onFocus = e => {
              focusField(name);
            };

            const onBlur = e => {
              // TODO: check here if this is an event or value. Is that possible?
              const value = e.target.value;
              blurField(name, value, validate);
            };

            const onMount = () => {
              registerField(name, defaultFieldState.value, validate);
            };

            const field = fields[name] || defaultFieldState;
            const value = field.value;
            const meta = field;
            // console.log('test', name);

            return (
              <FieldRenderer
                render={children}
                onMount={onMount}
                onChange={onChange}
                onFocus={onFocus}
                onBlur={onBlur}
                value={value}
                name={name}
                meta={meta}
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
