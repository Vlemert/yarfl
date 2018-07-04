import React from 'react';
import memoize from 'memoize-one';

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

    if (
      enableReinitialize &&
      liveInitialValue !== undefined &&
      initialValue !== liveInitialValue
    ) {
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

  memoizedRender = memoize(
    (render, name, value, initialValue, format, field) =>
      render({
        input: {
          onChange: this.onChange,
          onFocus: this.onFocus,
          onBlur: this.onBlur,
          name,
          value: format ? format(value) : value
        },
        ...field,
        initialValue
      })
  );

  render() {
    const { render, name, value, initialValue, format, field } = this.props;

    return this.memoizedRender(
      render,
      name,
      value,
      initialValue,
      format,
      field
    );
  }
}

export default FieldRenderer;
