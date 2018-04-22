import React from 'react';

import { defaultFieldState } from '../state/index';
import FormRenderer from './form-renderer';

class FieldRenderer extends React.Component {
  componentDidMount() {
    const { name, validate, registerField } = this.props;
    registerField(name, defaultFieldState.value, validate);
  }

  onChange = e => {
    const { name, validate, changeField } = this.props;
    // TODO: check here if this is an event or value. Is that possible?
    const value = e.target.value;
    changeField(name, value, validate);
  };

  onFocus = e => {
    const { name, focusField } = this.props;
    focusField(name);
  };

  onBlur = e => {
    const { name, validate, blurField } = this.props;
    // TODO: check here if this is an event or value. Is that possible?
    const value = e.target.value;
    blurField(name, value, validate);
  };

  render() {
    const { render, name, field } = this.props;
    const { value, ...fieldState } = field;

    return (
      <FormRenderer
        render={render}
        props={{
          input: {
            onChange: this.onChange,
            onFocus: this.onFocus,
            onBlur: this.onBlur,
            name,
            value
          },
          ...fieldState
        }}
        trigger={field}
      />
    );
  }
}

export default FieldRenderer;
