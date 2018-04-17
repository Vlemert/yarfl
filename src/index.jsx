import React from 'react';

/**
 * GENERIC TODO LIST:
 *
 * - finish submit (submitting state, error handling, etc)
 * - errors on form level and a component to retrieve them
 * - component that retrieves all form values
 * - readonly field component?
 * - form sections (nested context providers I guess?)
 *
 */

/**
 * The function of this component is to render something based on a render
 * function and props. We do this because calling the render function directly
 * in a component like Form will cause the render function to be called every
 * time the state in Form changes. We only want the render function to be called
 * whenever the function itself changes, or whatever we pass in as the prop
 * `trigger`.
 *
 * TODO: think about this some more, this is basically memoization of the render
 * function. We might be able to do this without an extra component. This would
 * probably be even better performancewise and as a bonus look better in react
 * devtools
 */
class FormRenderer extends React.Component {
  shouldComponentUpdate(nextProps) {
    return (
      nextProps.render !== this.props.render ||
      nextProps.trigger !== this.props.trigger
    );
  }

  render() {
    const { render, props } = this.props;

    return render(props);
  }
}

const defaultFieldState = {
  value: '',
  error: undefined,
  active: false,
  invalid: false,
  valid: true,
  touched: false,
  dirty: false,
  pristine: true
};
const fieldReducer = (state = defaultFieldState, action = {}) => {
  switch (action.type) {
    case 'register':
    case 'change':
      return {
        ...state,
        value: action.payload.value,
        error: action.payload.error,
        invalid: !!action.payload.error,
        valid: !action.payload.error
      };
    case 'focus':
      return {
        ...state,
        active: true
      };
    case 'blur':
      return {
        ...state,
        value: action.payload.value,
        error: action.payload.error,
        invalid: !!action.payload.error,
        valid: !action.payload.error,
        touched: true,
        active: false
      };
    case 'submit': {
      return {
        ...state,
        touched: true
      };
    }
    default:
      return state;
  }
};

const fieldsReducer = (state = {}, action = {}) => {
  switch (action.type) {
    case 'register':
    case 'change':
    case 'focus':
    case 'blur': {
      const name = action.payload.path[0];
      const path = action.payload.path.slice(1);

      if (path.length) {
        const subFieldsState = state[name] && state[name];
        return {
          ...state,
          [name]: fieldsReducer(subFieldsState, {
            ...action,
            payload: {
              ...action.payload,
              path
            }
          })
        };
      }

      return {
        ...state,
        [name]: fieldReducer(state[name], action)
      };
    }
    case 'submit':
      return {
        ...state,
        ...Object.entries(state).reduce((fields, [name, field]) => {
          fields[name] = fieldReducer(field, action);
          return fields;
        }, {})
      };
    default:
      return state;
  }
};

const defaultFormState = {
  fields: {},
  submitting: false,
  error: undefined
};
const formReducer = (state = defaultFormState, action = {}) => {
  switch (action.type) {
    // TODO: place action types in a dict
    case 'register':
    case 'change':
    case 'focus':
    case 'blur':
      return {
        ...state,
        fields: fieldsReducer(state.fields, action)
      };
    case 'submit':
      return {
        fields: fieldsReducer(state.fields, action),
        submitting: true
      };
    case 'submit-failed':
      return {
        ...state,
        submitting: false,
        error: action.payload.error
      };
    case 'submit-success':
      return {
        ...state,
        submitting: false
      };
    default:
      return state;
  }
};

class FieldRenderer extends React.Component {
  componentDidMount() {
    this.props.onMount();
  }

  render() {
    const {
      render,
      onChange,
      onFocus,
      onBlur,
      value,
      name,
      meta,
      field
    } = this.props;

    return (
      <FormRenderer
        render={render}
        props={{
          input: {
            onChange,
            onFocus,
            onBlur,
            value,
            name
          },
          meta
        }}
        trigger={field}
      />
    );
  }
}

const pathToArray = path => {
  return path.split('.');
};

function createForm() {
  const Context = React.createContext({});

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

      const values = Object.entries(this.state.fields).reduce(
        (values, [key, field]) => {
          values[key] = field.value;
          return values;
        },
        {}
      );

      this.dispatch({
        type: 'submit'
      });

      if (Object.values(this.state.fields).some(field => field.invalid)) {
        this.dispatch({
          type: 'submit-failed',
          payload: {}
        });
        return;
      }

      this.props.onSubmit(values).then(
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
        // TODO: do we want to store an array, or just the first error?
        return validate.map(val => val(value));
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

  const State = ({ children }) => (
    <Context.Consumer>
      {({ error }) => (
        <FormRenderer render={children} props={{ error }} trigger={error} />
      )}
    </Context.Consumer>
  );

  /**
   * This component should do the following:
   * - pull state from context
   * - expose a new state to sub consumers, where the field functions are scoped
   *   to that same field
   *
   *   TODO: optimize by not updating the context value if fields we don't care
   *   about change
   */
  const SubField = ({ children, name: subFieldName }) => (
    <Context.Consumer>
      {({
        functions: { registerField, changeField, focusField, blurField },
        fields,
        ...state
      }) => {
        const newContext = {
          ...state,
          functions: {
            registerField: (name, value, validate) => {
              return registerField(`${subFieldName}.${name}`, value, validate);
            },
            changeField: (name, value, validate) => {
              return changeField(`${subFieldName}.${name}`, value, validate);
            },
            focusField: (name, value, validate) => {
              return focusField(`${subFieldName}.${name}`, value, validate);
            },
            blurField: (name, value, validate) => {
              return blurField(`${subFieldName}.${name}`, value, validate);
            }
          },
          fields: (fields[subFieldName] && fields[subFieldName]) || {}
        };

        return (
          <Context.Provider value={newContext}>{children}</Context.Provider>
        );
      }}
    </Context.Consumer>
  );

  Form.Field = Field;
  Form.State = State;
  Form.SubField = SubField;

  return Form;
}

export default createForm;
