require("dotenv").config()

const { ApolloServer } = require("@apollo/server")
const { startStandaloneServer } = require("@apollo/server/standalone")
const { GraphQLError } = require("graphql")
const jwt = require("jsonwebtoken")

const { mongoose } = require("mongoose")
const Author = require("./models/author")
const Book = require("./models/book")
const User = require("./models/user")

mongoose.set("strictQuery", false)
const MONGODB_URI = process.env.MONGODB_URI
console.log("connecting to", MONGODB_URI)

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("connected to MongoDB")
  })
  .catch((error) => {
    console.log("error connection to MongoDB:", error.message)
  })

let authors = [
  {
    name: "Robert Martin",
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: "Martin Fowler",
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963,
  },
  {
    name: "Fyodor Dostoevsky",
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821,
  },
  {
    name: "Joshua Kerievsky", // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  {
    name: "Sandi Metz", // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
]

let books = [
  {
    title: "Clean Code",
    published: 2008,
    author: "Robert Martin",
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "agile"],
  },
  {
    title: "Agile software development",
    published: 2002,
    author: "Robert Martin",
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ["agile", "patterns", "design"],
  },
  {
    title: "Refactoring, edition 2",
    published: 2018,
    author: "Martin Fowler",
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"],
  },
  {
    title: "Refactoring to patterns",
    published: 2008,
    author: "Joshua Kerievsky",
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "patterns"],
  },
  {
    title: "Practical Object-Oriented Design, An Agile Primer Using Ruby",
    published: 2012,
    author: "Sandi Metz",
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "design"],
  },
  {
    title: "Crime and punishment",
    published: 1866,
    author: "Fyodor Dostoevsky",
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "crime"],
  },
  {
    title: "Demons",
    published: 1872,
    author: "Fyodor Dostoevsky",
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "revolution"],
  },
]

const typeDefs = `
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  
  type Token {
    value: String!
  }
  
  type Author {
    id: ID!
    name: String!
    born: Int
    books: [Book!]!
    bookCount: Int!
  }
  
  type Book {
    id: ID!
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors:  [Author!]!
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book!
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }
`

const resolvers = {
  Query: {
    bookCount: async () => {
      return Book.countDocuments({})
    },
    authorCount: async () => {
      return Author.countDocuments({})
    },
    allBooks: async (_, args) => {
      let query = {}

      if (args.author) {
        const author = await Author.findOne({
          name: { $regex: new RegExp(`^${args.author}$`, "i") },
        })

        if (author) {
          query.author = author._id
        } else {
          return []
        }
      }

      if (args.genre) {
        query.genres = { $regex: new RegExp(`^${args.genre}$`, "i") }
      }

      const books = await Book.find(query).populate("author").exec()
      const filteredBooks = books.filter(
        (book) => book.author && book.author.name
      )

      return filteredBooks
    },
    allAuthors: async (root, args) => {
      const authors = await Author.find({})

      return authors
    },
    me: (root, args, context) => {
      return context.currentUser
    },
  },
  Author: {
    bookCount: async (root) => {
      const authorId = new mongoose.Types.ObjectId(root.id)
      return Book.countDocuments({ author: authorId })
    },
    books: async (root) => {
      const authorId = new mongoose.Types.ObjectId(root.id)
      return Book.find({ author: authorId })
    },
  },
  Mutation: {
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        })
      }

      const { title, author: authorName, published, genres } = args

      if (!title || !authorName || !published || !genres) {
        throw new GraphQLError("arguments are required.", {
          extensions: { code: "MISSING_ARGUMENTS" },
        })
      }

      let author = await Author.findOne({ name: authorName })
      if (!author) {
        author = new Author({ name: authorName })
        try {
          await author.save()
        } catch (error) {
          throw new GraphQLError("Saving author failed.", {
            extensions: { code: "DATABASE_ERROR", error },
          })
        }
      }

      const book = new Book({
        title,
        published,
        genres,
        author: author._id,
      })

      try {
        await book.save()

        author.books = author.books ? [...author.books, book._id] : [book._id]
        await author.save()
      } catch (error) {
        throw new GraphQLError("Saving book failed.", {
          extensions: { code: "DATABASE_ERROR", error },
        })
      }

      const savedBook = await Book.findById(book._id).populate("author")

      return savedBook
    },
    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        })
      }

      const { name, setBornTo } = args

      if (!name || !setBornTo) {
        throw new GraphQLError(
          "Both name and setBornTo arguments are required.",
          {
            extensions: {
              code: "MISSING_ARGUMENTS",
              missingFields: !name ? "name" : "setBornTo",
            },
          }
        )
      }

      const author = await Author.findOne({ name })
      if (!author) {
        throw new GraphQLError("Author not found.", {
          extensions: {
            code: "AUTHOR_NOT_FOUND",
            invalidArgs: name,
          },
        })
      }

      author.born = setBornTo

      try {
        const updatedAuthor = await author.save()
        return updatedAuthor
      } catch (error) {
        throw new GraphQLError("Failed to update author.", {
          extensions: {
            code: "DATABASE_ERROR",
            error,
          },
        })
      }
    },

    createUser: async (root, args) => {
      if (!args.favoriteGenre) {
        throw new GraphQLError("favoriteGenre is required", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: "favoriteGenre",
          },
        })
      }

      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
      })

      try {
        const newUser = await user.save()
        return newUser
      } catch (error) {
        throw new GraphQLError("Creating the user failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.username,
            error,
          },
        })
      }
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== "secret") {
        throw new GraphQLError("wrong credentials", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        })
      }

      const userForToekn = {
        username: user.username,
        id: user._id,
      }

      return {
        value: jwt.sign(userForToekn, process.env.JWT_SECRET),
      }
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null

    if (auth && auth.startsWith("Bearer ")) {
      const decodedToken = jwt.verify(auth.substring(7), process.env.JWT_SECRET)

      const currentUser = await User.findById(decodedToken.id).populate("books")

      return { currentUser }
    }
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
