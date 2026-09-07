import './Login.css'

function Login() {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
  }

  return (
    <main className="login-page">

      <div className="login-container">

        <h1 className="login-title">Login</h1>

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >

          <div className="form-group">
            <label htmlFor="username">
              Username
            </label>

            <input
              id="username"
              type="text"
              placeholder="Enter your username"
            />
          </div>


          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
            />
          </div>


          <button
            type="button"
            className="forgot-password"
          >
            Forgot password?
          </button>


          <button
            type="submit"
            className="login-button"
          >
            Login
          </button>


          <p className="signup-text">
            New customer?

            <button
              type="button"
              className="signup-link"
            >
              Sign up
            </button>
          </p>

        </form>

      </div>

    </main>
  )
}

export default Login