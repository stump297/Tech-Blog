const path = require("path");
const express = require("express");
const session = require("express-session");
const exphbs = require("express-handlebars");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
require("dotenv").config();
const routes = require("./controllers");
const sequelize = require("./config/connection");
const helpers = require("./utils/helpers");
const fs = require("fs");
const app = express();
const { Client } = require("pg");

const PORT = process.env.PORT || 3001;

// select the handelbars helpers
const hbs = exphbs.create({ helpers });

const sess = {
  secret: "Super secret secret",
  cookie: {
    maxAge: 300000,
    httpOnly: true,
    secure: false,
    sameSite: "strict",
  },
  resave: false,
  saveUninitialized: true,
  store: new SequelizeStore({
    db: sequelize,
  }),
};

app.use(session(sess));

// select the handlebars template
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(routes);

// Initialize the database
const initDb = async () => {
  const client = new Client({
    user: process.env.DB_USER,
    host: "localhost",
    password: process.env.DB_PASSWORD,
    port: 5432,
  });
  // dropping or creating db
  try {
    await client.connect();
    await client.query(`DROP DATABASE IF EXISTS ${process.env.DB_NAME}`);
    await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
    console.log("Database dropped and created successfully");
  } catch (err) {
    console.error("Error dropping and creating database:", err);
  } finally {
    await client.end();
  }

  try {
    await sequelize.sync({ force: true });
    console.log("Database initialized");
  } catch (err) {
    console.error("Error initializing database:", err);
  }
};

initDb().then(() => {
  app.listen(PORT, () => console.log(`Server started @ ${PORT}`));
});
