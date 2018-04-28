import produce from 'immer';

const defaultFieldState = {
  value: '',
  error: undefined,
  active: false,
  invalid: false,
  valid: true,
  touched: false,
  initialValue: '',
  dirty: false,
  pristine: true,
  __field__: true
};

const defaultRootState = {
  fields: {},
  formState: {
    submitting: false,
    error: undefined
  }
};

const produceField = (field, changes, isInitialization = false) =>
  produce(field, draftField => {
    Object.entries(changes).forEach(([key, value]) => {
      draftField[key] = value;
    });

    if (isInitialization) {
      draftField.initialValue = draftField.value;
    } else {
      draftField.dirty = draftField.value !== draftField.initialValue;
      draftField.pristine = draftField.value === draftField.initialValue;
    }

    draftField.invalid = !!draftField.error;
    draftField.valid = !draftField.error;

    if (field.active && !draftField.active) {
      draftField.touched = true;
    }
  });

const setDeepField = (fields, path, changes, isInitialization) => {
  let field = fields;
  const pathLength = path.length;
  for (let i = 0; i < pathLength; i++) {
    const nextName = path[i];

    if (i === pathLength - 1) {
      if (field[nextName] && isInitialization) {
        return;
      }

      field[nextName] = produceField(
        field[nextName] || defaultFieldState,
        changes,
        isInitialization
      );
    } else {
      field = field[nextName] = field[nextName] || {};
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

const changeField = (path, changes, isInitialization) =>
  produce(draftState => {
    setDeepField(draftState.fields, path, changes, isInitialization);
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
