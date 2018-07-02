import React from 'react';
import PropTypes from 'prop-types';
import isEqual from 'react-fast-compare';
import memoize from 'memoize-one';

import { pathToArray } from '../util/index';
import { defaultRootState, actions } from '../state/index';
import FormRenderer from './form-renderer';
import Context from './context';

class Form extends React.Component {
  dispatch = stateModifier => {
    if (this.unmounted) {
      return;
    }

    this.setState(stateModifier);
  };

  handleSubmit = e => {
    e.preventDefault();

    const { onSubmit, onSubmitSuccess, onSubmitFail } = this.props;
    const { fields, values } = this.state;

    if (Object.values(fields).some(field => field.invalid)) {
      return;
    }

    this.dispatch(actions.submit());

    let submitResult;
    try {
      submitResult = onSubmit(values);
    } catch (error) {
      this.dispatch(actions.submitFail(error));
      onSubmitFail && onSubmitFail(error);
      return;
    }

    if (Promise.resolve(submitResult) === submitResult) {
      Promise.resolve(submitResult).then(
        result => {
          this.dispatch(actions.submitSuccess());
          onSubmitSuccess && onSubmitSuccess(result);
        },
        error => {
          this.dispatch(actions.submitFail(error));
          onSubmitFail && onSubmitFail(error);
        }
      );
      return;
    }

    this.dispatch(actions.submitSuccess());
    onSubmitSuccess && onSubmitSuccess(submitResult);
  };

  getErrors = (value, validate) => {
    if (!validate) return undefined;

    if (Array.isArray(validate)) {
      let error;
      for (const validator of validate) {
        error = validator(value);
        if (error) break;
      }
      return error;
    }

    return validate(value);
  };

  functions = {
    registerField: (name, value, validate) => {
      this.dispatch(
        actions.changeField(
          pathToArray(name),
          {
            value,
            error: this.getErrors(value, validate)
          },
          true
        )
      );
    },
    changeField: (name, value, validate) => {
      this.dispatch(
        actions.changeField(pathToArray(name), {
          value,
          error: this.getErrors(value, validate)
        })
      );
    },
    focusField: name => {
      this.dispatch(
        actions.changeField(pathToArray(name), {
          active: true
        })
      );
    },
    blurField: (name, value, validate) => {
      this.dispatch(
        actions.changeField(pathToArray(name), {
          value,
          error: this.getErrors(value, validate),
          active: false
        })
      );
    },
    reinitializeField: (name, value, validate) => {
      this.dispatch(
        actions.changeField(
          pathToArray(name),
          {
            value,
            error: this.getErrors(value, validate)
          },
          false,
          true
        )
      );
    }
  };

  state = {
    ...defaultRootState,
    functions: this.functions,
    initialValues: this.props.initialValues,
    initial: this.props.initialValues || defaultRootState.initial,
    values: this.props.initialValues || defaultRootState.initial
  };

  static getDerivedStateFromProps(props, state) {
    if (
      props.enableReinitialize &&
      !isEqual(state.initialValues, props.initialValues)
    ) {
      return {
        initialValues: props.initialValues,
        initial: props.initialValues || state.initial,
        values: props.initialValues || state.initial
      };
    }

    return null;
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  // TODO: we pass everything in the state down to context consumers, we might
  // want to be a bit more picky. For example: initialValues is no longer needed
  getProviderValue = memoize((enableReinitialize, state) => {
    const value = {
      enableReinitialize,
      ...state
    };
    return value;
  });

  render() {
    const { children } = this.props;

    const providerValue = this.getProviderValue(
      this.props.enableReinitialize,
      this.state
    );

    return (
      <Context.Provider value={providerValue}>
        <FormRenderer
          render={children}
          props={{
            submit: this.handleSubmit
          }}
        />
      </Context.Provider>
    );
  }
}

Form.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onSubmitSuccess: PropTypes.func,
  onSubmitFail: PropTypes.func,
  initialValues: PropTypes.object,
  enableReinitialize: PropTypes.bool
};

export default Form;
