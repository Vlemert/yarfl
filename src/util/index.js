export const getFieldValues = fields =>
  Object.entries(fields).reduce((values, [key, field]) => {
    if (field.hasOwnProperty('value')) {
      values[key] = field.value;
    } else {
      values[key] = getFieldValues(field);
    }
    return values;
  }, {});

export const pathToArray = path => {
  return path.split('.');
};
