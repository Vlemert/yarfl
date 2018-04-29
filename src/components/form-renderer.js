import React from 'react';

/**
 * The function of this component is to render something based on a render
 * function and props. We do this because calling the render function directly
 * in a component like Form will cause the render function to be called every
 * time the state in Form changes. We only want the render function to be called
 * whenever the function itself changes, or whatever we pass in as the prop
 * `trigger`.
 *
 * TODO: think about this some more, this is basically memoization of the render
 * function. We might be able to do this without an extra component. This would
 * probably be even better performancewise and as a bonus look better in react
 * devtools
 */
class FormRenderer extends React.Component {
  shouldComponentUpdate(nextProps) {
    return (
      nextProps.render !== this.props.render ||
      nextProps.trigger !== this.props.trigger ||
      nextProps.triggers.length !== this.props.triggers.length ||
      nextProps.triggers.some(
        (trigger, i) => trigger !== this.props.triggers[i]
      )
    );
  }

  render() {
    const { render, props } = this.props;

    return render(props);
  }
}

FormRenderer.defaultProps = {
  triggers: []
};

export default FormRenderer;
