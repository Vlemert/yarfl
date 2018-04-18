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

export { defaultFieldState, formReducer }
