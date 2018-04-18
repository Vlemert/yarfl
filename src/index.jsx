import React from 'react';

import createFormComponent from './components/form';
import createStateComponent from './components/state';
import createFieldComponent from './components/field';
import createSubFieldComponent from './components/sub-field';

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

function createForm() {
  const Context = React.createContext({});

  const Form = createFormComponent(Context);
  Form.Field = createFieldComponent(Context);
  Form.State = createStateComponent(Context);
  Form.SubField = createSubFieldComponent(Context);

  return Form;
}

export default createForm;
