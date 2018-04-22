import React from 'react';

import Form from './components/form';
import State from './components/state';
import Field from './components/field';
import SubField from './components/sub-field';

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

export default {
  Form,
  Field,
  State,
  SubField
};
