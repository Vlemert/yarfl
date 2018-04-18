import React from 'react';

import FormRenderer from './form-renderer';

class FieldRenderer extends React.Component {
  componentDidMount() {
    this.props.onMount();
  }

  render() {
    const {
      render,
      onChange,
      onFocus,
      onBlur,
      value,
      name,
      meta,
      field
    } = this.props;

    return (
      <FormRenderer
        render={render}
        props={{
          input: {
            onChange,
            onFocus,
            onBlur,
            value,
            name
          },
          meta
        }}
        trigger={field}
      />
    );
  }
}

export default FieldRenderer;
