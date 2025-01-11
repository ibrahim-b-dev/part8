import { useMutation } from "@apollo/client"
import { useEffect, useState } from "react"
import { LOGIN } from "../queries"

const LoginForm = ({ show, setToken, setPage }) => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const [login, result] = useMutation(LOGIN)

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value
      setToken(token)
      localStorage.setItem("library-user-token", token)
      setPage("books")
    }
  }, [result.data])

  const submit = (event) => {
    event.preventDefault()

    login({ variables: { username, password } })
  }

  if (!show) {
    return null
  }

  return (
    <form onSubmit={submit}>
      <div>
        username
        <input
          value={username}
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        password
        <input
          value={password}
          onChange={({ target }) => setPassword(target.value)}
          type="password"
        />
      </div>

      <button type="submit">login</button>
    </form>
  )
}

export default LoginForm
