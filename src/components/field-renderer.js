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
    const { name, value, validate, registerField } = this.props;
    registerField(name, value, validate);
  }

  componentDidUpdate(prevProps) {
    const {
      name,
      validate,
      enableReinitialize,
      initialValue,
      liveInitialValue,
      reinitializeField
    } = this.props;

    if (enableReinitialize && initialValue !== liveInitialValue) {
      reinitializeField(name, liveInitialValue, validate);
    }
  }

  onChange = e => {
    const { name, validate, parse, changeField } = this.props;
    const value = getValue(e);
    changeField(name, parse ? parse(value) : value, validate);
  };

  onFocus = e => {
    const { name, focusField } = this.props;
    focusField(name);
  };

  onBlur = e => {
    const { name, validate, parse, blurField } = this.props;
    const value = getValue(e);
    blurField(name, parse ? parse(value) : value, validate);
  };

  render() {
    const { render, name, value, initialValue, format, field } = this.props;

    return (
      <FormRenderer
        render={render}
        props={{
          input: {
            onChange: this.onChange,
            onFocus: this.onFocus,
            onBlur: this.onBlur,
            name,
            value: format ? format(value) : value
          },
          ...field,
          initialValue
        }}
        triggers={[field, value, initialValue]}
      />
    );
  }
}

export default FieldRenderer;
