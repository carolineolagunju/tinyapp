const express = require('express');
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.com"
};

//hello page
app.get("/", (req, res) => {
  res.send("Hello!");
});

//json page
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//hello world page http://localhost:8080/hello
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
});

//urls page
app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
});

//short and long url page
app.get("/urls/:id", (req, res) => {
  const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on PORT ${PORT}!`);
});