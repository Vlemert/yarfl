import React from 'react';
import PropTypes from 'prop-types';

import Context from './context';

class ValueRenderer extends React.Component {
  shouldComponentUpdate(nextProps) {
    const { render, value } = this.props;
    return render !== nextProps.render || value !== nextProps.value;
  }

  render() {
    const { render, value } = this.props;
    return render({
      value
    });
  }
}

class ValueStateCache extends React.Component {
  state = {
    value: this.props.value
  };

  updateValue = () => {
    const { value, debounceMs } = this.props;
    const { value: stateValue } = this.state;

    if (debounceMs && value !== stateValue) {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.setState({
          value
        });
      }, debounceMs);
    }
  };

  shouldComponentUpdate(nextProps, nextState) {
    const { render, value, debounceMs } = this.props;
    const { value: stateValue } = this.state;
    return (
      render !== nextProps.render ||
      value !== nextProps.value ||
      debounceMs !== nextProps.debounceMs ||
      stateValue !== nextState.value
    );
  }

  componentDidMount() {
    this.updateValue();
  }

  componentDidUpdate(prevProps) {
    this.updateValue(prevProps.value);
  }

  render() {
    const { render, value, debounceMs } = this.props;
    const { value: stateValue } = this.state;

    return (
      <ValueRenderer render={render} value={debounceMs ? stateValue : value} />
    );
  }
}

class Value extends React.Component {
  render() {
    const { name, children, debounceMs } = this.props;

    return (
      <Context.Consumer>
        {({ initialValues, values, initial }) => {
          const initialValueFromForm = initialValues && initialValues[name];
          const initialValueFromState = initial[name];

          let liveInitialValue;
          if (initialValueFromForm !== undefined) {
            liveInitialValue = initialValueFromForm;
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
            <ValueStateCache
              render={children}
              value={value}
              debounceMs={debounceMs}
            />
          );
        }}
      </Context.Consumer>
    );
  }
}

Value.propTypes = {
  name: PropTypes.string.isRequired,
  children: PropTypes.func.isRequired,
  debounceMs: PropTypes.number
};

Value.defaultProps = {
  debounceMs: 100
};

export default Value;
