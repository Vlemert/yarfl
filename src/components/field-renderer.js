import React from 'react';

import { defaultFieldState } from '../state/index';
import FormRenderer from './form-renderer';

function isEvent(eventOrValue) {
  return (
    eventOrValue && eventOrValue.preventDefault && eventOrValue.stopPropagation
  );
}

function getValue(eventOrValue) {
  if (!isEvent(eventOrValue)) {
    return eventOrValue;
  }

  return eventOrValue.target.value;
}

class FieldRenderer extends React.Component {
  componentDidMount() {
    const { name, validate, registerField, field } = this.props;
    const { value } = field;
    registerField(name, value, validate);
  }

  onChange = e => {
    const { name, validate, changeField } = this.props;
    changeField(name, getValue(e), validate);
  };

  onFocus = e => {
    const { name, focusField } = this.props;
    focusField(name);
  };

  onBlur = e => {
    const { name, validate, blurField } = this.props;
    blurField(name, getValue(e), validate);
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
