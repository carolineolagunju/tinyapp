const express = require('express');
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
app.use(express.urlencoded({extended:true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());


// Database object
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.com"
};


// function to generate a random short url
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
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


//urls page
app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});


//the form page
app.get("/urls/new", (req, res) => {
  const templateVars = {urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});


//short and long url page
app.get("/urls/:id", (req, res) => {
  const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});


//post route
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  let randomId = generateRandomString();
  urlDatabase[randomId] = longURL;
  //update the redirection URL
  res.redirect(`/urls/${randomId}`);
});


//post route that updates a url resource
app.post("/urls/:id", (req, res) => {
  const urlToEdit = req.params.id;
  const newURL = req.body.newURL;
  if (urlDatabase[urlToEdit]);
  urlDatabase[urlToEdit] = newURL;
  res.redirect("/urls");
});


//This route deletes a specified url and redirects the page back to /urls
app.post("/urls/:id/delete", (req, res) => {
  const urlToDelete = req.params.id;
  if (urlDatabase[urlToDelete]) {
    delete urlDatabase[urlToDelete];
  } else {
    res.send(`url not found`);
  }
  res.redirect("/urls");
});


//redirect route
app.get("/u/:id", (req, res) => {
  const shortId = req.params.id;
  const longURL = urlDatabase[shortId];
  res.redirect(longURL);
});

//user login route
app.post("/login", (req, res) => {
  const newUsername = req.body.username;
  //sets the username as a cookie
  res.cookie('username', newUsername);
  res.redirect("/urls");
});


//user logout route
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on PORT ${PORT}!`);
});