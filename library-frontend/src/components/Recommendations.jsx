import { useQuery } from "@apollo/client"
import { ALL_BOOKS, ME } from "../queries"

const Recommendations = (props) => {
  const { loading: meLoading, error: meError, data: meData } = useQuery(ME)

  const favoriteGenre = meData?.me?.favoriteGenre

  const {
    loading: booksLoading,
    error: booksError,
    data: booksData,
  } = useQuery(ALL_BOOKS, {
    variables: { genre: favoriteGenre },
    skip: !favoriteGenre,
  })

  const favoriteBooks = booksData?.allBooks || []
  
  if (booksLoading) {
    return <div>Loading books...</div>
  }

  if (booksError) {
    return <div>Error fetching books...</div>
  }

  if (meLoading) {
    return <div>Loading user data...</div>
  }

  if (meError) {
    return <div>Error fetching user data...</div>
  }

  if (!props.show) {
    return null
  }

  return (
    <div>
      <h2>recommendations</h2>
      <p>
        books in your favorite genre <strong>{favoriteGenre}</strong>
      </p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {favoriteBooks.map((b) => (
            <tr key={b.title}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Recommendations
