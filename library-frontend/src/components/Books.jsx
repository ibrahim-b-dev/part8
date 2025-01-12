import { useQuery } from "@apollo/client"
import { ALL_BOOKS } from "../queries"
import { useState } from "react"

const Books = (props) => {
  const { loading, error, data } = useQuery(ALL_BOOKS)
  const [genreFilter, setGenreFilter] = useState("")

  if (!props.show) {
    return null
  }

  if (loading) {
    return <div>loading...</div>
  }

  if (error) {
    return <div>error...</div>
  }

  const genres = Array.from(
    new Set(data.allBooks.flatMap((book) => book.genres))
  )

  const filteredBooks = genreFilter
  ? data.allBooks.filter((book) => book.genres.includes(genreFilter))
  : data.allBooks;

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {filteredBooks.map((a) => (
            <tr key={a.id}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        {genres.map((g) => (
          <button key={g} onClick={() => setGenreFilter(g)}>
            {g}
          </button>
        ))}
        <button onClick={() => setGenreFilter("")}>all genres</button>
      </div>
    </div>
  )
}

export default Books
