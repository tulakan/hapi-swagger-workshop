"use strict";

const Hapi = require("@hapi/hapi");
const fs = require("fs");
const util = require("util");
const Inert = require("@hapi/inert");
const Vision = require("@hapi/vision");
const HapiSwagger = require("hapi-swagger");

// Convert fs.readFile, fs.writeFile into Promise version of same
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const server = Hapi.server({
  port: 3000,
  host: "localhost",
});

server.route({
  method: "GET",
  path: "/books",
  options: {
    description: "Get books list",
    notes: "Returns an array of books",
    tags: ["api"],
    handler: async (request, h) => {
      const books = await readFile("./books.json", "utf8");
      return h.response(JSON.parse(books));
    },
  },
});
server.route({
  method: "POST",
  path: "/books",
  options: {
    description: "Create book",
    notes: "Returns an array of books",
    tags: ["api"],
    handler: async (request, h) => {
      console.log(request.payload);
      const book = JSON.parse(JSON.stringify(request.payload));
      let books = await readFile("./books.json", "utf8");
      books = JSON.parse(books);
      // setting id
      book.id = books.length + 1;
      books.push(book);
      await writeFile("./books.json", JSON.stringify(books, null, 2), "utf8");
      return h.response(books).code(200);
    },
  },
});
server.route({
  method: "PUT",
  path: "/books/{id}",
  options: {
    description: "Update book by id",
    notes: "Returns an array of books",
    tags: ["api"],
    handler: async (request, h) => {
      const updBook = JSON.parse(JSON.stringify(request.payload));
      const id = request.params.id;
      let books = await readFile("./books.json", "utf8");
      books = JSON.parse(books);
      // finding book by id and rewriting
      books.forEach((book) => {
        if (book.id == id) {
          book.title = updBook.title;
          book.author = updBook.author;
        }
      });
      await writeFile("./books.json", JSON.stringify(books, null, 2), "utf8");
      return h.response(books).code(200);
    },
  },
});

server.route({
  method: "DELETE",
  path: "/books/{id}",
  options: {
    description: "Delete book by id",
    notes: "Returns an array of books",
    tags: ["api"],
    handler: async (request, h) => {
      const id = request.params.id;
      let books = await readFile("./books.json", "utf8");
      books = JSON.parse(books);
      // rewriting the books array
      books = books.filter((book) => book.id != id);
      await writeFile("./books.json", JSON.stringify(books, null, 2), "utf8");
      return h.response(books).code(200);
    },
  },
});

const init = async () => {
  const swaggerOptions = {
    info: {
      title: "Books API Documentation",
      version: "0.0.1",
    },
  };

  await server.register([
    Inert,
    Vision,
    {
      plugin: HapiSwagger,
      options: swaggerOptions,
    },
  ]);
  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
