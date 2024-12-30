import { gql } from "@apollo/client"

export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      id
      name
      born
      bookCount
    }
  }
`
export const ALL_BOOKS = gql`
  query {
    allBooks {
      id
      author
      title
      published
    }
  }
`

// createBook is the mutation operation name
// $title, $author, $published and $genres is a variables of type String!

// addBook is the mutation being executed, used to add a new person to the system.
// It accepts and set it's arguments with the values that passed from named mutation

export const CREATE_BOOK = gql`
  mutation createBook(
    $title: String!
    $author: String!
    $published: Int!
    $genres: [String!]!
  ) {
    addBook(
      title: $title
      author: $author
      published: $published
      genres: $genres
    ) {
      title
      author
      published
      genres
    }
  }
`