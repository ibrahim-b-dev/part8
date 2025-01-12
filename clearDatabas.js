require("dotenv").config()

const { mongoose } = require("mongoose");
const Author = require("./models/author");
const Book = require("./models/book");
const User = require("./models/user");

mongoose.set("strictQuery", false);
const MONGODB_URI = process.env.MONGODB_URI;

console.log("Connecting to", MONGODB_URI);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    // Clear all documents from each collection
    return Promise.all([
      Author.deleteMany({}),
      Book.deleteMany({}),
      User.deleteMany({}),
    ]);
  })
  .then(() => {
    console.log("Database cleared");

    // Close the connection after clearing the database
    mongoose.connection.close();
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB or clearing the database:", error.message);
    mongoose.connection.close();
  });
