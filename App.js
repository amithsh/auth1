const { request, response } = require("express");
const Dbconnect = require("./Db/Dbconnect");
const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secretKey = crypto.randomBytes(32).toString("hex");
const auth = require("./Auth");

const port = 3001;

const app = express();
app.use(express.json());
const User = require("./Db/Usermodel");


app.listen(port, () => {
  console.log("app is listening on port:", port);
});

app.post("/register", (request, response) => {
  bcrypt
    .hash(request.body.password, 10)
    .then((hashedpassword) => {
      const newUser = new User({
        email: request.body.email,
        password: hashedpassword,
      });

      newUser
        .save()
        .then((result) => {
          response.status(201).send({
            message: "user created succefully",
            result,
          });
        })
        .catch((error) => {
          response.status(500).send({
            message: "error creating User",
            error,
          });
        });
    })

    .catch((error) => {
      response.status(500).send({
        message: "password not hashed successfully",
        error,
      });
    });
});

app.post("/login", (request, response) => {
  const { email, password } = request.body;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return response.status(404).send({
          message: "user not found",
        });
      }
      bcrypt
        .compare(password, user.password)
        .then((pass) => {
          const token = jwt.sign(
            {
              userId: user._id,
              userEmail: user.email,
            },

            "secret-key",
            { expiresIn: "24h" }
          );
          return response.status(200).send({
            message: "user logged in ",
            email,
            token
          });
          if (!pass) {
            return response.status(400).send({
              message: "password does not match",
            });
          }
        })
        .catch((error) => {
          response.status(400).send({
            message: "password does not match",
            error,
          });
        });
    })
    .catch((error) => {
      response.status(404).send({ message: "email doesnt exist", error });
    });
});

app.get("/free-end-point", (request, response) => {
  try {
    response.json({ message: "you are free to use this " });
  } catch (error) {
    response.status(400).send({
      message: "bad ",
      error,
    });
  }
});

app.get("/auth-end-point", auth, (request, response) => {
  response.json({ message: "you can now access me " });
});

Dbconnect();
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

