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
class SubField extends React.Component {
  memoizedGetSubFunctions = memoize((functions, subFieldName) => {
    const {
      registerField,
      changeField,
      focusField,
      blurField,
      reinitializeField
    } = functions;

    return {
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
      },
      reinitializeField: (name, value, validate) => {
        return reinitializeField(`${subFieldName}.${name}`, value, validate);
      }
    };
  });

  memoizedGetSubContext = memoize(
    (functions, enableReinitialize, fields, values, initial) => {
      return {
        enableReinitialize,
        functions,
        fields,
        values,
        initial
      };
    }
  );

  render() {
    const { name: subFieldName, children } = this.props;

    return (
      <Context.Consumer>
        {({ functions, enableReinitialize, fields, values, initial }) => {
          const subFunctions = this.memoizedGetSubFunctions(
            functions,
            subFieldName
          );
          const newContext = this.memoizedGetSubContext(
            subFunctions,
            enableReinitialize,
            fields[subFieldName] || {},
            values[subFieldName] || {},
            initial[subFieldName] || {},
            subFieldName
          );

          return (
            <Context.Provider value={newContext}>{children}</Context.Provider>
          );
        }}
      </Context.Consumer>
    );
  }
}

SubField.propTypes = {
  name: PropTypes.string.isRequired,
  children: PropTypes.node
};

export default SubField;
