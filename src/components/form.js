import React from 'react';
import PropTypes from 'prop-types';

import { pathToArray, getFieldValues } from '../util/index';
import { formReducer } from '../state/index';
import FormRenderer from './form-renderer';
import Context from './context';

class Form extends React.Component {
  // TODO: we need to come up with a better state update strategy. The way we
  // update now causes updates even when nothing changes (fieldsReducer returns
  // new instance with same values sometimes, same for formReducer)
  // Visible effect: on submit every field renders because we flip `touched` to
  // true, even if it's already true.
  dispatch = action => {
    this.setState(state => formReducer(state, action));
  };

  submit = e => {
    e.preventDefault();

    const { onSubmit } = this.props;
    const { fields } = this.state;

    const values = getFieldValues(fields);

    this.dispatch({
      type: 'submit'
    });

    if (Object.values(fields).some(field => field.invalid)) {
      this.dispatch({
        type: 'submit-failed',
        payload: {}
      });
      return;
    }

    let submitResult;
    try {
      submitResult = onSubmit(values);
    } catch (error) {
      this.dispatch({
        type: 'submit-failed',
        payload: {
          error
        }
      });
    }

    // TODO: this can cause react errors if the component unmounts
    Promise.resolve(submitResult).then(
      result => {
        this.dispatch({
          type: 'submit-success'
        });
      },
      error => {
        this.dispatch({
          type: 'submit-failed',
          payload: {
            error
          }
        });
      }
    );
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

  changeField = (name, value, validate) => {
    // TODO: split out action creator functions
    this.dispatch({
      type: 'change',
      payload: {
        path: pathToArray(name),
        value,
        error: this.getErrors(value, validate)
      }
    });
  };

  focusField = name => {
    this.dispatch({
      type: 'focus',
      payload: {
        path: pathToArray(name)
      }
    });
  };

  blurField = (name, value, validate) => {
    this.dispatch({
      type: 'blur',
      payload: {
        path: pathToArray(name),
        value,
        error: this.getErrors(value, validate)
      }
    });
  };

  registerField = (name, value, validate) => {
    this.dispatch({
      type: 'register',
      payload: {
        path: pathToArray(name),
        value,
        error: this.getErrors(value, validate)
      }
    });
  };

  functions = {
    changeField: this.changeField,
    focusField: this.focusField,
    blurField: this.blurField,
    registerField: this.registerField,
    getField: this.getField
  };

  state = {
    ...formReducer(),
    functions: this.functions
  };

  render() {
    const { children } = this.props;

    // TODO: we pass the entire state here, so that subscribers get updated
    // whenever the state changes. There might be a nicer way to notify them.
    return (
      <Context.Provider value={this.state}>
        <FormRenderer render={children} props={{ submit: this.submit }} />
      </Context.Provider>
    );
  }
}

Form.propTypes = {
  onSubmit: PropTypes.func.isRequired
};

export default Form;
