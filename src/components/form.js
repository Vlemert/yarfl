import React from 'react';
import PropTypes from 'prop-types';

import { pathToArray, getFieldValues } from '../util/index';
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
    const { fields } = this.state;

    const values = getFieldValues(fields);

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
    }
  };

  state = {
    ...defaultRootState,
    functions: this.functions
  };

  componentWillUnmount() {
    this.unmounted = true;
  }

  render() {
    const { children } = this.props;

    return (
      <Context.Provider value={this.state}>
        <FormRenderer render={children} props={{ submit: this.handleSubmit }} />
      </Context.Provider>
    );
  }
}

Form.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onSubmitSuccess: PropTypes.func,
  onSubmitFail: PropTypes.func
};

export default Form;
