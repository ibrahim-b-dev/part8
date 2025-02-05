import { gql } from "@apollo/client"

export const ALL_AUTHORS = gql`
  query AllAuthors {
    allAuthors {
      id
      name
      born
      bookCount
    }
  }
`

export const ALL_BOOKS = gql`
  query AllBooks($genre: String, $author: String) {
    allBooks(genre: $genre, author: $author) {
      id
      title
      published
      genres
      author {
        id
        name
      }
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
      id
      title
      author {
        id
        name
        born
      }
      published
      genres
    }
  }
`

// EDIT_AUTHOR constant holding the mutation query - Frontend (React)
export const EDIT_AUTHOR = gql`
  # operation name for the mutation - Frontend (GraphQL Query)
  # a label you provide to your GraphQL client to identify the mutation operation.
  mutation editAuthor($name: String!, $setBornTo: Int!) {
    # the actual mutation field defined in your GraphQL backend schema.
    # It's the name of the resolver function on the server that handles the request for this mutation.
    editAuthor(name: $name, setBornTo: $setBornTo) {
      born
    }
  }
`

export const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`

export const ME = gql`
  query me {
    me {
      id
      username
      favoriteGenre
    }
  }
`
