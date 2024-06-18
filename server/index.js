const express = require("express");
const mongoose = require("mongoose");
const { graphqlHTTP } = require("express-graphql");
const schema = require("./schema/schema");
const { requireAuth } = require("./middleware/auth");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
// Initialize express app
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to database");
  })
  .catch((e) => {
    console.log(e);
  });

// Middleware for authentication
// app.use(requireAuth);

// Public GraphQL endpoint (no auth required)
app.use(
  "/graphql/public",
  graphqlHTTP((req) => ({
    schema,
    graphiql: true,
    context: {
      req,
      isAuthenticated: false,
      organizationLoader,
    },
  }))
);

// Protected GraphQL endpoint (auth required)
app.use(
  "/graphql/protected",
  requireAuth,
  graphqlHTTP((req) => ({
    schema,
    graphiql: true,
    context: {
      req,
      isAuthenticated: true,
      user: req.user,
      organizationLoader,
    },
  }))
);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
