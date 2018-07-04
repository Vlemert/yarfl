import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';

import { defaultFieldState } from '../state/index';
import Context from './context';

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

class FieldLifecycle extends React.Component {
  componentDidMount() {
    this.props.didMount();
  }

  componentDidUpdate() {
    this.props.didUpdate();
  }

  render() {
    return this.props.render();
  }
}

class Field extends React.Component {
  memoizedRender = memoize(
    (
      render,
      name,
      value,
      initialValue,
      field,
      format,
      parse,
      validate,
      changeField,
      focusField,
      blurField
    ) => {
      const onChange = e => {
        const value = getValue(e);
        changeField(name, parse ? parse(value) : value, validate);
      };

      const onFocus = e => {
        focusField(name);
      };

      const onBlur = e => {
        const value = getValue(e);
        blurField(name, parse ? parse(value) : value, validate);
      };

      return render({
        input: {
          onChange,
          onFocus,
          onBlur,
          name,
          value: format ? format(value) : value
        },
        ...field,
        initialValue
      });
    }
  );

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
          enableReinitialize,
          fields,
          values,
          initial
        }) => {
          const field = fields[name] || defaultFieldState;

          const initialValueFromState = initial[name];

          const initialValue =
            initialValueFromState || initialValueFromField || '';

          const valueFromState = values[name];
          const value = valueFromState || initialValue;

          const didMount = () => {
            registerField(name, value, validate);
          };

          const didUpdate = () => {
            // TODO: it appears this never happens in the test cases we have
            // right now.
            if (
              enableReinitialize &&
              initialValueFromField !== undefined &&
              initialValue !== initialValueFromField
            ) {
              reinitializeField(name, initialValueFromField, validate);
            }
          };

          return (
            <FieldLifecycle
              render={() =>
                this.memoizedRender(
                  children,
                  name,
                  value,
                  initialValue,
                  field,
                  format,
                  parse,
                  validate,
                  changeField,
                  focusField,
                  blurField
                )
              }
              didMount={didMount}
              didUpdate={didUpdate}
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
