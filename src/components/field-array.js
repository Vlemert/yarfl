import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';

import Context from './context';

/**
 * This component should do the following:
 * - pull state from context
 * - expose a new state to sub consumers, where the field functions are scoped
 *   to that same field
 */
class FieldArray extends React.Component {
  memoizedGetFieldArrayFunctions = memoize((functions, fieldArrayName) => {
    const {
      registerField,
      changeField,
      focusField,
      blurField,
      reinitializeField
    } = functions;

    return {
      registerField: (name, value, validate) => {
        return registerField(`${fieldArrayName}[0].${name}`, value, validate);
      },
      changeField: (name, value, validate) => {
        return changeField(`${fieldArrayName}.${name}`, value, validate);
      },
      focusField: (name, value, validate) => {
        return focusField(`${fieldArrayName}.${name}`, value, validate);
      },
      blurField: (name, value, validate) => {
        return blurField(`${fieldArrayName}.${name}`, value, validate);
      },
      reinitializeField: (name, value, validate) => {
        return reinitializeField(`${fieldArrayName}.${name}`, value, validate);
      }
    };
  });

  render() {
    const { name: fieldArrayName, children } = this.props;

    return (
      <Context.Consumer>
        {({ functions, initialValues, fields, values, initial, ...state }) => {
          const fieldArrayFunctions = this.memoizedGetFieldArrayFunctions(
            functions,
            fieldArrayName
          );

          // console.log(fields, values);
          const items = values[fieldArrayName] || [];
          const insert = (index, item) => {};
          const append = item => {
            // TODO: validate?
            functions.changeField(fieldArrayName, [...items, item]);
          };
          const removeAt = index => {};
          const renderItems = renderItem =>
            items.map((item, index) => {
              const newContext = {
                ...state,
                functions: fieldArrayFunctions,
                initialValues: initialValues && initialValues[fieldArrayName],
                fields:
                  (fields[fieldArrayName] && fields[fieldArrayName][index]) ||
                  {},
                values:
                  (values[fieldArrayName] && values[fieldArrayName][index]) ||
                  {},
                initial:
                  (initial[fieldArrayName] && initial[fieldArrayName][index]) ||
                  {}
              };

              const remove = () => removeAt(index);

              return (
                <Context.Provider key={index} value={newContext}>
                  {renderItem({ item, index, remove })}
                </Context.Provider>
              );
            });

          // TODO: optimize render?
          return children({ items, insert, append, renderItems });
        }}
      </Context.Consumer>
    );
  }
}

FieldArray.propTypes = {
  name: PropTypes.string.isRequired,
  children: PropTypes.func.isRequired
};

export default FieldArray;
