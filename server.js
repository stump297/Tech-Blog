const path = require("path");
const express = require("express");
const session = require("express-session");
const exphbs = require("express-handlebars");
const SequelizeStore = require("connect-session-sequelize")(session.Store);

const routes = require("./controllers");
const sequelize = require("./config/connection");
const helpers = require("./utils/helpers");

const app = express();
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
const initDb = () => {
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  sequelize
    .query(schema)
    .then(() => {
      console.log("Database initialized");
    })
    .catch((err) => {
      console.error("Error initializing database:", err);
    });
};

sequelize.sync({ force: false }).then(() => {
  initDb();
  app.listen(PORT, () => console.log("Now listening"));
});
