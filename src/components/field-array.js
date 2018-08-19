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
const empty = [];

class FieldArray extends React.Component {
  memoizedGetFieldArrayFunctions = memoize((functions, fieldArrayName) => {
    const {
      registerField,
      changeField,
      focusField,
      blurField,
      reinitializeField
    } = functions;
    console.log('get array functions');

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

  memoizedGetHelperFunctions = memoize(
    (
      fieldArrayFunctions,
      changeFieldArray,
      fieldArrayName,
      items,
      fieldArrayFields,
      fieldArrayValues,
      fieldArrayInitial,
      enableReinitialize
    ) => {
      console.log('get helper functions');
      // console.log('render');
      console.log(this.last === fieldArrayFields);
      console.log(this.last, '----', fieldArrayFields);
      this.last = fieldArrayFields;
      const insert = (index, item) => {};
      const append = item => {
        // TODO: validate? < don't know what I meant with that

        /**
         * So there's some stuff that should happen here. Appending is easier
         * because we just add the item to the end.
         */
        changeFieldArray(fieldArrayName, [...items, item]);
      };
      const removeAt = index => {};
      const renderItems = renderItem =>
        items.map((item, index) => {
          const newContext = {
            functions: fieldArrayFunctions,
            fields: fieldArrayFields[index] || {},
            values: fieldArrayValues[index] || {},
            initial: fieldArrayInitial[index] || {},
            enableReinitialize
          };

          const remove = () => removeAt(index);

          return (
            <Context.Provider key={index} value={newContext}>
              {renderItem({ item, index, remove })}
            </Context.Provider>
          );
        });

      return {
        insert,
        append,
        removeAt,
        renderItems
      };
    }
  );

  memoizedRender = memoize((render, items, insert, append, renderItems) => {
    // console.log('render');
    // console.log(a === insert);
    // a = insert;
    return render({ items, insert, append, renderItems });
  });

  render() {
    const { name: fieldArrayName, children } = this.props;

    return (
      <Context.Consumer>
        {({ functions, fields, values, initial, enableReinitialize }) => {
          const fieldArrayFunctions = this.memoizedGetFieldArrayFunctions(
            functions,
            fieldArrayName
          );

          const items = values[fieldArrayName] || [];
          const fieldArrayFields = fields[fieldArrayName] || [];
          const fieldArrayValues = values[fieldArrayName] || [];
          const fieldArrayInitial = initial[fieldArrayName] || [];
          // console.log({
          //   items,
          //   fields,
          //   values,
          //   initial,
          //   bla: fieldArrayFields
          // });
          // console.log({
          //   items,
          //   fieldArrayFields,
          //   fieldArrayValues,
          //   fieldArrayInitial
          // });
          const {
            insert,
            append,
            removeAt,
            renderItems
          } = this.memoizedGetHelperFunctions(
            fieldArrayFunctions,
            functions.changeFieldArray,
            fieldArrayName,
            items,
            fieldArrayFields,
            fieldArrayValues,
            fieldArrayInitial,
            enableReinitialize
          );

          // TODO: optimize render?
          console.log('hoi');
          return this.memoizedRender(
            children,
            items,
            insert,
            append,
            renderItems
          );
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
