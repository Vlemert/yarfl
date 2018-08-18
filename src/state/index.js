import produce from 'immer';
import isEqual from 'react-fast-compare';

const defaultFieldState = {
  error: undefined,
  active: false,
  invalid: false,
  valid: true,
  touched: false,
  dirty: false,
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
    dirty: false
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
      const nextIsArray = !isNaN(parseInt(path[i + 1]));
      field[nextName] = field[nextName] || (nextIsArray ? [] : {});
      field = field[nextName];
    }
  }
};

const setDeepFieldArray = (fields, path, value) => {
  let field = fields;
  const pathLength = path.length;
  for (let i = 0; i < pathLength; i++) {
    const nextName = path[i];

    if (i === pathLength - 1) {
      field[nextName] = value;
    } else {
      const nextIsArray = !isNaN(parseInt(path[i + 1]));
      field[nextName] = field[nextName] || (nextIsArray ? [] : {});
      field = field[nextName];
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
    // console.log('change', path, value);
    let newFieldDirty;
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
      newFieldDirty = !isEqual(storedValue, storedInitialValue);
    }

    setDeepField(
      draftState.fields,
      path,
      newFieldDirty !== undefined
        ? {
            ...changes,
            dirty: newFieldDirty
          }
        : changes,
      isRegistration,
      isInitialization
    );
    // TODO: figure out what to do here once we validate on form level (and
    // fields might not be registered). Should decouple valid state from
    // registered fields as well, like with values and initial?
    draftState.formState.valid = everyField(
      draftState.fields,
      field => field.valid
    );
    draftState.formState.invalid = !draftState.formState.valid;

    draftState.formState.dirty = !isEqual(
      draftState.values,
      draftState.initial
    );
  });

const changeFieldArray = (path, { value }) =>
  produce(draftState => {
    setDeepFieldArray(draftState.values, path, value);
    setDeepFieldArray(draftState.initial, path, value);
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
  changeFieldArray,
  submit,
  submitSuccess,
  submitFail
};

export { defaultFieldState, defaultRootState, actions };
