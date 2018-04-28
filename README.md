# YARFL

Yes, this is Yet Another React Form Library.

## Install

```
npm i yarfl --save
```

or

```
yarn add yarfl
```

## Basic usage

```js
import React from 'react';
import Yarfl from 'yarfl';

const required = value => (value ? undefined : 'Required field');

const LoginForm = ({ doLogin }) => (
  <Yarfl.Form onSubmit={doLogin}>
    {({ submit }) => (
      <form onSubmit={submit}>
        <Yarfl.Field name="username" validate={required}>
          {({ input, touched, error }) => (
            <div>
              {touched && error}
              <input type="text" {...input} />
            </div>
          )}
        </Yarfl.Field>
        <Yarfl.Field name="password" validate={required}>
          {({ input, touched, error }) => (
            <div>
              {touched && error}
              <input type="password" {...input} />
            </div>
          )}
        </Yarfl.Field>
        <button type="submit">Login</button>
      </form>
    )}
  </Yarfl.Form>
);
```

## API

### <Yarfl.Form />

Use this component to create the root of your form. It will hold all state, and
makes that available to Yarfl components rendered in its subtree. `Yarfl.Form`
expects a render function to be passed to `children`. For performance reasons,
this function will only be called if the function itself changes, and thus does
not receive any form state.

```js
import React from 'react';
import Yarfl from 'yarfl';

const SimpleForm = () => (
  <Yarfl.Form
    onSubmit={values => {
      // handle submit here
    }}
  >
    {({ submit }) => (
      <form onSubmit={submit}>
        <button type="submit">Login</button>
      </form>
    )}
  </Yarfl.Form>
);
```

#### Props passed to the render function

##### submit

Event handler to be passed to `<form>`.

#### children

Whatever is returned here will be rendered by Yarfl.

#### onSubmit

Function that is called when the form submits. Can return a promise. If an error
is thrown or the returned promise rejects the form will enter an error state and
the returned error will be passed to `<Yarfl.State>`

#### onSubmitSuccess

Function that is called when submitting succeeds.

##### result

Any result returned from onSubmit

#### onSubmitFail

Function that is called when submitting fails

##### error

The error that caused the submit failure

#### initialValues

Pass an object with initial field values here.

_Note: setting a value for a field here will take precedence over any value set
directly on `<Yarfl.Field>`._

### <Yarfl.Field />

Use this component to create your form's fields. It provides access to the
current state of a specific field, and makes sure that your form fields are only
rendered when necessary.

```js
import React from 'react';
import Yarfl from 'yarfl';

const SimpleForm = () => (
  <Yarfl.Form
    onSubmit={values => {
      // handle submit here
    }}
  >
    {({ submit }) => (
      <form onSubmit={submit}>
        <Yarfl.Field name="username">
          {({ input, touched, error }) => (
            <div>
              {touched && error && `Incorrect value: ${error}`}
              <input type="text" {...input} />
            </div>
          )}
        </Yarfl.Field>
        <button type="submit">Login</button>
      </form>
    )}
  </Yarfl.Form>
);
```

#### Props passed to the render function

##### input

Props to pass through to your input field.

##### error

If validation fails the error will be passed here.

##### active

Whether the field has focus

##### invalid

Whether validation failed

##### valid

Whether validation has not failed

##### touched

Whether the field has been touched since the form was rendered. Automatically
set to `true` on blur, and on form submit.

##### initialValue

The initial value of the field.

\_Note: this value will be ignored if an initial value for the same field is set
on `<Yarfl.Form>`.

##### dirty

True if the current value is not equal to the initial value, false otherwise.

##### pristine

True if the current value is equal to the initial value, false otherwise.

#### children

Whatever is returned here will be rendered by Yarfl.

#### name

Name of the field.

#### validate

Either a validation function, or an array of validation functions.

#### initialValue

Define the initial value of the field (string, number, or boolean).

_Note: if you render multiple fields with the same name, the first field that
mounts will 'win' and it's `initialValue` will be taken. Even if the
`initialValue` of that field is empty or undefined._

### <Yarfl.SubField />

Use this component to create a section in your form.

```js
import React from 'react';
import Yarfl from 'yarfl';

const SimpleForm = () => (
  <Yarfl.Form
    onSubmit={values => {
      // values = { name: '', address: { street: '', zip: '' } }
    }}
  >
    {({ submit }) => (
      <form onSubmit={submit}>
        <Yarfl.Field name="name">{/* */}</Yarfl.Field>
        <Yarfl.SubField name="address">
          <Yarfl.Field name="street">{/* */}</Yarfl.Field>
          <Yarfl.Field name="zip">{/* */}</Yarfl.Field>
        </Yarfl.SubField>
        <button type="submit">Login</button>
      </form>
    )}
  </Yarfl.Form>
);
```

##### name

Name of the section.

### <Yarfl.State />

Use this component to access the state of a form. This component will not
receive the state of individual fields, use `Yarfl.Field` for that.
`Yarfl.State` expects a render function to be passed to `children`.

```js
import React from 'react';
import Yarfl from 'yarfl';

const SimpleForm = () => (
  <Yarfl.Form
    onSubmit={values => {
      // handle submit here
    }}
  >
    {({ submit }) => (
      <form onSubmit={submit}>
        <Yarfl.State>
          {({ error }) => error && `An error occurred: ${error}`}
        </Yarfl.State>
        <button type="submit">Login</button>
      </form>
    )}
  </Yarfl.Form>
);
```

#### Props passed to the render function

##### submitting

Whether the form is submitting.

##### error

Whenever an error is thrown in `onSubmit`, that error will be passed here.
`undefined` if no failed form submission occurred yet.

#### valid

Opposite of invalid. True if _all_ fields in the form are valid, false
otherwise.

#### invalid

Opposite of valid. True if _any_ field in the form is invalid, false otherwise.

#### dirty

Opposite of pristine. True if _any_ field in the form is dirty, false otherwise.

#### pristine

Opposite of dirty. True if _all_ fields in the form are pristine, false
otherwise.
