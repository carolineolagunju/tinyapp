// express setup
const express = require('express');
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
app.use(express.urlencoded({extended:true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());



// url Database object
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.com"
};



//users Database Object
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};



// function to generate a random ucid
const generateRandomString = function() {
  let output = "";
  const string = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    output += string.charAt(Math.floor(Math.random() * string.length));
  }
  return output;
};



// Function to find a user by email
const findUser = function(userEmail) {
  let currentUserObj;

  for (const user in users) {
    if (users[user]["email"] === userEmail) {
      currentUserObj = users[user];
    }
  }
  return currentUserObj;
};



//my urls page
app.get("/urls", (req, res) => {
  const id = req.cookies.user_id;
  const user = users[id];
  const templateVars = {urls: urlDatabase, user};
  res.render("urls_index", templateVars);
});



//create new url page
app.get("/urls/new", (req, res) => {
  const id = req.cookies.user_id;
  const user = users[id];
  const templateVars = {urls: urlDatabase, user};
  res.render("urls_new", templateVars);
});



//Existing url page
app.get("/urls/:id", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = {id, longURL, user};
  res.render("urls_show", templateVars);
});



//post route for creating a new url
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

  if (urlDatabase[urlToEdit]) {
    urlDatabase[urlToEdit] = newURL;
    res.redirect("/urls");
  }
});



//This route deletes a specified url and redirects the page back to /urls
app.post("/urls/:id/delete", (req, res) => {
  const urlToDelete = req.params.id;

  //Checking if the url to be deleted exist in the urlDatabase
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



//post route for newUser signup
app.get("/register", (req, res) => {
  res.render("user_register", {user: null});
});



//newUser signup route
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).send(`Please enter a valid password or email`);
    return;
  }
  
  if (findUser(email)) {
    res.status(400).send(`email already exists, please enter a valid email`);
    return;
  }

  const newUser = {id, email, password};
  users[id] = newUser;
  res.cookie("user_id", id);
  res.redirect("/urls");
});



//get route for userlogin
app.get("/login", (req, res) => {
  res.render("user_login", {user: null});
});



//post route for userlogin
app.post("/login", (req, res) => {
  const {email, password} = req.body;
  const user = findUser(email);

  if (user && password === user.password) {
    res.cookie("user_id", user.id);
    res.redirect("/urls");
    return;
  }

  res.status(403).send(`User not found, please enter a valid email or password`);
});



//user logout route
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});



app.listen(PORT, () => {
  console.log(`Example app listening on PORT ${PORT}!`);
});