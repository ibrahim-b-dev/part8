import { useState } from "react"
import Authors from "./components/Authors"
import Books from "./components/Books"
import NewBook from "./components/NewBook"
import LoginForm from "./components/LoginForm"
import { useApolloClient } from "@apollo/client"
import useToken from "./hooks/useToken"
import Recommendations from "./components/Recommendations"

const App = () => {
  const { token, saveToken, clearToken } = useToken()
  const [page, setPage] = useState("authors")
  const client = useApolloClient()

  const logout = () => {
    clearToken()
    client.resetStore()
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {token ? (
          <>
            <button onClick={() => setPage("add")}>add book</button>
            <button onClick={() => setPage("recommend")}>recommend</button>
            <button onClick={logout}>logout</button>
          </>
        ) : (
          <button onClick={() => setPage("login")}>login</button>
        )}
      </div>

      <Authors show={page === "authors"} />

      <Books show={page === "books"} />

      <NewBook show={page === "add"} />
      
      <Recommendations show={page === "recommend"} />

      <LoginForm
        show={page === "login"}
        setToken={saveToken}
        setPage={setPage}
      />
    </div>
  )
}

export default App
