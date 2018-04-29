import produce from 'immer';

const defaultFieldState = {
  error: undefined,
  active: false,
  invalid: false,
  valid: true,
  touched: false,
  dirty: false,
  pristine: true,
  __field__: true
};

const defaultRootState = {
  fields: {},
  values: {},
  initial: {},
  formState: {
    submitting: false,
    error: undefined,
    valid: true,
    invalid: false,
    dirty: false,
    pristine: true
  }
};

const produceField = (
  field,
  changes,
  isRegistration = false,
  isInitialization = false
) =>
  produce(field, draftField => {
    Object.entries(changes).forEach(([key, value]) => {
      draftField[key] = value;
    });

    draftField.invalid = !!draftField.error;
    draftField.valid = !draftField.error;

    if (field.active && !draftField.active) {
      draftField.touched = true;
    }
  });

const setDeepField = (
  fields,
  path,
  changes,
  isRegistration,
  isInitialization
) => {
  let field = fields;
  const pathLength = path.length;
  for (let i = 0; i < pathLength; i++) {
    const nextName = path[i];

    if (i === pathLength - 1) {
      if (field[nextName] !== undefined && isRegistration) {
        return;
      }

      field[nextName] = produceField(
        field[nextName] || defaultFieldState,
        changes,
        isRegistration,
        isInitialization
      );
    } else {
      field = field[nextName] = field[nextName] || {};
    }
  }
};

const setDeepValue = (values, path, value, overrideNodes) => {
  let valueObj = values;
  const pathLength = path.length;
  for (let i = 0; i < pathLength; i++) {
    const nextName = path[i];

    if (i === pathLength - 1) {
      if (valueObj[nextName] !== undefined && !overrideNodes) {
        return valueObj[nextName];
      }

      valueObj[nextName] = value;
      return value;
    } else {
      valueObj = valueObj[nextName] = valueObj[nextName] || {};
    }
  }
};

const setAllFields = (fields, changes) => {
  Object.entries(fields).forEach(([name, field]) => {
    if (field.__field__) {
      fields[name] = produceField(field, changes);
    } else {
      setAllFields(field, changes);
    }
  });
};

const everyField = (fields, callback) => {
  return Object.values(fields).every(field => {
    if (field.__field__) {
      return callback(field);
    } else {
      return everyField(field, callback);
    }
  });
};

const changeField = (
  path,
  { value, ...changes },
  isRegistration,
  isInitialization
) =>
  produce(draftState => {
    let newFieldPristine;
    if (value !== undefined) {
      const storedValue = setDeepValue(
        draftState.values,
        path,
        value,
        !isRegistration
      );
      const storedInitialValue = setDeepValue(
        draftState.initial,
        path,
        value,
        isInitialization
      );
      newFieldPristine = storedValue === storedInitialValue;
    }

    setDeepField(
      draftState.fields,
      path,
      newFieldPristine !== undefined
        ? {
            ...changes,
            dirty: !newFieldPristine,
            pristine: newFieldPristine
          }
        : changes,
      isRegistration,
      isInitialization
    );
    // TODO: optimize this by not checking if the state of the current field
    // confirms the form state (like below for dirty/pristine)
    draftState.formState.valid = everyField(
      draftState.fields,
      field => field.valid
    );
    draftState.formState.invalid = !draftState.formState.valid;

    if (
      newFieldPristine !== undefined &&
      ((draftState.formState.pristine && !newFieldPristine) ||
        (draftState.formState.dirty && newFieldPristine))
    ) {
      draftState.formState.pristine = everyField(
        draftState.fields,
        field => field.pristine
      );
      draftState.formState.dirty = !draftState.formState.pristine;
    }
  });

const submit = () =>
  produce(draftState => {
    setAllFields(draftState.fields, { touched: true });
    draftState.formState.submitting = true;
    draftState.formState.error = undefined;
  });

const submitSuccess = () =>
  produce(draftState => {
    draftState.formState.submitting = false;
    draftState.formState.error = undefined;
  });

const submitFail = error =>
  produce(draftState => {
    draftState.formState.submitting = false;
    draftState.formState.error = error;
  });

const actions = {
  changeField,
  submit,
  submitSuccess,
  submitFail
};

export { defaultFieldState, defaultRootState, actions };
