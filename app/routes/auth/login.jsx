import { useActionData, redirect, json } from 'remix'
import { db } from '~/utils/db.server'
import { createUserSession, login, register } from '~/utils/session.server'

function validateUsername(username) {
  if (typeof username !== 'string' || username.length < 3) {
    return 'Username must be at least 3 characters'
  }
}

function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 6) {
    return 'Password must be at least 6 characters'
  }
}

function badRequest(data) {
  return json(data, { status: 400 })
}

export const action = async ({ request }) => {
  const form = await request.formData()
  const loginType = form.get('loginType')
  const username = form.get('username')
  const password = form.get('password')

  const fields = { loginType, username, password }

  const fieldErrors = {
    username: validateUsername(username),
    password: validatePassword(password),
  }

  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields })
  }

  switch (loginType) {
    case 'login': {
      // Find user
      const user = await login({ username, password })

      // Check user
      if (!user) {
        return badRequest({
          fields,
          fieldErrors: { username: 'Invalid credentials' },
        })
      }

      // Create Session
      return createUserSession(user.id, '/posts')
    }
    case 'register': {
      // Check if user exists
      const userExists = await db.user.findFirst({
        where: {
          username,
        },
      })
      if (userExists) {
        return badRequest({
          fields,
          fieldErrors: { username: `User ${username} already exists` },
        })
      }

      // Create user
      const user = await register({ username, password })
      if (!user) {
        return badRequest({
          fields,
          formError: 'Something went wrong',
        })
      }

      // Create session
      return createUserSession(user.id, '/posts')
    }
    default: {
      return badRequest({
        fields,
        formError: 'Login type is invalid',
      })
    }
  }

  return redirect('/posts')
}

function Login() {
  const actionData = useActionData()

  return (
    <div className='auth-container'>
      <div className='page-header'>
        <h1>Login</h1>
      </div>

      <div className='page-content'>
        <form method='POST'>
          <fieldset>
            <legend>Login or Register</legend>
            <label>
              <input
                type='radio'
                name='loginType'
                value='login'
                defaultChecked={
                  !actionData?.fields?.loginType ||
                  actionData?.fields?.loginType === 'login'
                }
              />{' '}
              Login
            </label>

            <label>
              <input
                type='radio'
                name='loginType'
                value='register'
                defaultChecked={actionData?.fields?.loginType === 'register'}
              />{' '}
              Register
            </label>
          </fieldset>
          <div className='form-control'>
            <label htmlFor='username'>Username</label>
            <input
              type='text'
              name='username'
              id='username'
              defaultValue={actionData?.fields?.username}
            />
            <div className='error'>
              {actionData?.fieldErrors?.username ? (
                <p
                  className='form-validation-error'
                  role='alert'
                  id='username-error'
                >
                  {actionData.fieldErrors.username}
                </p>
              ) : null}
            </div>
          </div>

          <div className='form-control'>
            <label htmlFor='password'>Password</label>
            <input
              type='password'
              name='password'
              id='password'
              defaultValue={actionData?.fields?.password}
            />
            <div className='error'>
              {actionData?.fieldErrors?.password ? (
                <p
                  className='form-validation-error'
                  role='alert'
                  id='password-error'
                >
                  {actionData.fieldErrors.password}
                </p>
              ) : null}
            </div>
          </div>

          <button className='btn btn-block' type='submit'>
            Submit
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
