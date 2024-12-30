import { useMutation, useQuery } from "@apollo/client"
import { ALL_AUTHORS, EDIT_AUTHOR } from "../queries"
import { useState } from "react"

const Authors = (props) => {
  const { loading, error, data } = useQuery(ALL_AUTHORS)
  const [updateAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  })

  const [name, setName] = useState("")
  const [born, setBorn] = useState("")

  const submit = (event) => {
    event.preventDefault()

    updateAuthor({
      variables: { name, setBornTo: parseInt(born) },
    })

    setName("")
    setBorn("")
  }

  if (!props.show) {
    return null
  }

  if (loading) {
    return <div>loading...</div>
  }

  if (error) {
    return <div>error...</div>
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {data.allAuthors.map((a) => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <h3>Set birthyear</h3>
        <form onSubmit={submit}>
          <p>
            <label htmlFor="name">name</label>
            <select
              id="name"
              value={name}
              onChange={({ target }) => setName(target.value)}
            >
              <option value="">Select an author</option>
              {data.allAuthors.map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
          </p>

          <p>
            <label htmlFor="name">born</label>
            <input
              value={born}
              onChange={({ target }) => setBorn(target.value)}
              type="number"
              id="born"
            />
          </p>
          <button type="submit">update author</button>
        </form>
      </div>
    </div>
  )
}

export default Authors
