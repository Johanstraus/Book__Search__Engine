const express = require('express');
const path = require('path');
const db = require('./config/connection');

const {ApolloServer} = require("apollo-server-express");

// Authentication middleware
const { authMiddleware } = require('./utils/auth')

const { typeDefs, resolvers} = require('./schemas');
const { isContext } = require('vm');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// No routes will be used with SPA app.use(routes);


const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client"));
});

const apolloServerStart = async (typeDefs, resolvers) => {
  await server.start();

  server.applyMiddleware({ app });
}
db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
});

apolloServerStart(typeDefs, resolvers)