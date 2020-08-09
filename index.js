const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const uuid = require("uuid");
const User = require("./dummyData/users");

require("dotenv").config();

const app = express();

const schema = require("./graphQl/schema");

const uri = `mongodb://worrzell:${process.env.MONGO_PASS}@social-media-shard-00-00.kytgg.mongodb.net:27017,social-media-shard-00-01.kytgg.mongodb.net:27017,social-media-shard-00-02.kytgg.mongodb.net:27017/social-media?ssl=true&replicaSet=atlas-7v232a-shard-0&authSource=admin&retryWrites=true&w=majority`;
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("DB Connected"));

mongoose.connection.on("error", (err) => {
  console.log(`DB connection error: ${err.message}`);
});

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const users = User.getUsers();
  const matchingUser = users.find((user) => user.id === id);
  done(null, matchingUser);
});

const SESSION_SECRECT = "bad secret";

app.use(
  session({
    genid: (req) => uuid(),
    secret: SESSION_SECRECT,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());

app.use(passport.session());

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`A Node Js API is listening on port: ${port}`);
});
