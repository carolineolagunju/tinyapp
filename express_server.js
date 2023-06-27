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


// function to generate a random short url
const generateRandomString = function() {
  let output = "";
  const string = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    output += string.charAt(Math.floor(Math.random() * string.length));
  }
  return output;
};


const findUser = function(userEmail) {
  let currentUserObj;

  for (const userInfo in users) {
    if(users[userInfo]["email"] === userEmail) {
      currentUserObj = users[userInfo];
    }
  } 
  return currentUserObj
}

//urls page
app.get("/urls", (req, res) => {
  const id = req.cookies.user_id;
  console.log(id);
  console.log(users);
  const templateVars = {urls: urlDatabase, email: users[id]["email"]};
  res.render("urls_index", templateVars);
});


//the form page
app.get("/urls/new", (req, res) => {
  const id = req.cookies.user_id;
  const templateVars = {urls: urlDatabase, email: users[id]["email"]};
  res.render("urls_new", templateVars);
});


//short and long url page
app.get("/urls/:id", (req, res) => {
  const id = req.cookies.user_id;
  const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id], email: users[id]["email"]};
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


//user signup route
app.get("/register", (req, res) => {
  const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("user_register", templateVars)
});



//newUser signup route
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
     res.status(400).send(`Please enter a valid password or email`)
  }
  
   if (findUser(email)) {
    res.status(400).send(`email already exists, please enter a valid email`);
   }

  const newUser = {id, email, password};
  users[id] = newUser;
  res.cookie("user_id", id);
  res.redirect("/urls");
});



//user login route
app.post("/login", (req, res) => {
  const newUsername = req.body.email;
  //sets the username as a cookie
  res.cookie("username", newUsername);
  res.redirect("/urls");
});


//user logout route
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/register");
});


app.listen(PORT, () => {
  console.log(`Example app listening on PORT ${PORT}!`);
});