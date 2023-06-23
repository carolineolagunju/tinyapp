const express = require('express');
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
app.use(express.urlencoded({extended:true}));''

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.com"
};

const generateRandomString = function() {
  let output = "";
  const string = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++) {
    output += string.charAt(Math.floor(Math.random() * string.length));
  }
  return output;
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

//the form page
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//short and long url page
app.get("/urls/:id", (req, res) => {
  const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
});

//post route
app.post('/urls', (req, res) => {
  console.log(req.body);
  res.send('Ok');
})
app.listen(PORT, () => {
  console.log(`Example app listening on PORT ${PORT}!`);
});