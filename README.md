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

### <Yarfl.Field />

### <Yarfl.SubField />

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

##### error

Whenever an error is thrown in `onSubmit`, that error will be passed here.
`undefined` if no failed form submission occurred yet.
