const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const { createServer } = require('http');
const { PubSub } = require('graphql-subscriptions');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');

// Module imports
const typeDefs = require('./schema');
const createResolvers = require('./resolvers');

const pubsub = new PubSub();

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  
  // Create resolvers with pubsub injection
  const resolvers = createResolvers(pubsub);
  
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  
  const server = new ApolloServer({
    schema,
    introspection: true,
    playground: true,
    plugins: [{
      serverWillStart() {
        return {
          drainServer() {
            return Promise.resolve();
          }
        };
      }
    }]
  });
  
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql'
  });
  
  useServer({ schema }, wsServer);
  
  await server.start();
  server.applyMiddleware({ app });
  
  const PORT = 8080;
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`🔗 Subscriptions ready at ws://localhost:${PORT}${server.graphqlPath}`);
    console.log('\n📖 Example queries available at:');
    console.log('https://github.com/spenderella/graphql-articles/tree/main/queries');
  });
}

startServer().catch(error => {
  console.error('Error starting server:', error);
});