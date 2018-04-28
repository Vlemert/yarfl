import React from 'react';
import PropTypes from 'prop-types';

import Context from './context';

/**
 * This component should do the following:
 * - pull state from context
 * - expose a new state to sub consumers, where the field functions are scoped
 *   to that same field
 *
 *   TODO: optimize by not updating the context value if fields we don't care
 *   about change
 */
const SubField = ({ name: subFieldName, children }) => (
  <Context.Consumer>
    {({
      functions: { registerField, changeField, focusField, blurField },
      initialValues,
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
        initialValues: initialValues && initialValues[subFieldName],
        fields: (fields[subFieldName] && fields[subFieldName]) || {}
      };

      return <Context.Provider value={newContext}>{children}</Context.Provider>;
    }}
  </Context.Consumer>
);

SubField.propTypes = {
  name: PropTypes.string.isRequired,
  children: PropTypes.node
};

export default SubField;
