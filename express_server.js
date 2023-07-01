// express setup
const express = require('express');
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
app.use(express.urlencoded({extended:true}));
const bcrypt = require('bcryptjs');

const cookieSession = require('cookie-session');

app.use(cookieSession({
  name: "user_id",
  keys: ["supersecretkey", "anothersupersecretkey"],
  //cookie expires in 24 hours
  maxAge: 24 * 60 * 60 * 1000,
}));



// url Database object
const urlDatabase = {
  "qw2mei": {
    longURL: 'http://www.germany.com',
    userID: "gy71q6",
  },

  "swwb9b": {
    longURL: 'http://www.example.com',
    userID: "gy71q6",
  },

  "n3y4cb": {
    longURL: 'http://www.yahoo.com',
    userID: '5ff0b9',
  }
};



//users Database Object
const users = {
  "gy71q6": {
    id: 'gy71q6',
    email: 'caroline@gmail.com',
    hashedPassword: '$2a$10$Q1cCLuLpI5KIjkLgEkTqFOpOc3WEgh8mr3TrRmVdEFAEz7TIDgI96'
  },

  "5ff0b9": {
    id: '5ff0b9',
    email: 'car@gmail.com',
    hashedPassword: '$2a$10$ozkixx0Jrgs5A3C7Zc12cOHmR73DGD2j.5xBj4FuBjvQ.LZ9XQquy'
  }
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



//Function to search for the urls that belongs to a currently logged-in user using their id
const urlsForUser = function(id) {
  let result = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      result[key] = urlDatabase[key];
    }
  }

  return result;
};



//my urls page
app.get("/urls", (req, res) => {

  const id = req.session.user_id;

  //if no cookie has been set
  if (!id) {
    res.send(`Please login to view this page`);
    return;
  }

  const user = users[id];
  //calling function urlsForUser to retrieve users urls
  const usersURL = urlsForUser(id);
  const templateVars = {urls: usersURL, user};
  res.render("urls_index", templateVars);
});



//post route for creating a new url
app.post("/urls", (req, res) => {
  const userId = req.session.user_id;

  //preventing user from creating new url if they are not logged in
  if (!userId) {
    res.send(`Please login to access this route`);
  }
  const longURL = req.body.longURL;
  const randomId = generateRandomString();

  //set a new url for the user in the urlDatabase
  const newUrlDatabase = {longURL, userID: userId};
  urlDatabase[randomId] = newUrlDatabase;
  //update the redirection URL
  res.redirect(`/urls/${randomId}`);
});



//create new url page
app.get("/urls/new", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  const templateVars = {urls: urlDatabase, user};

  //preventing user from accessing the page if not logged in
  if (!id) {
    res.redirect("/login");
    return;
  }
  res.render("urls_new", templateVars);
});



//get route for editing url
app.get("/urls/:id", (req, res) => {
  const userId = req.session.user_id;

  //Disallowed user from viewing page if not logged in
  if (!userId) {
    res.send(`Please login to view this page!`);
    return;
  }

  //checking if url belongs to user
  const userFilteredUrlDatabase = urlsForUser(userId);
  const id = req.params.id;

  if (!userFilteredUrlDatabase[id]) {
    res.send(`This url does not belong to you!`);
    return;
  }

  //rendering myUrls page
  const user = users[userId];
  const longURL = userFilteredUrlDatabase[id].longURL;
  const templateVars = {id, longURL, user};
  res.render("urls_show", templateVars);
});




//post route for editing a url resource
app.post("/urls/:id", (req, res) => {
  const urlToEdit = req.params.id;
  const newURL = req.body.newURL;

  //checking if the url to be edited exists in urlDatabase
  if (urlDatabase[urlToEdit].longURL) {
    urlDatabase[urlToEdit].longURL = newURL;
    res.redirect("/urls");
  }
});



//This route deletes a specified url and redirects the page back to /urls
app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.user_id;

  // checking if url belongs to user
  const userFilteredUrlDatabase = urlsForUser(userId);
  const id = req.params.id;

  // Disallowing user to delete url if they are not the owner
  if (!userFilteredUrlDatabase[id]) {
    res.send(`This url does not belong to you!`);
    return;
  } else {
    //delete url from database if it exists and if the user is the originator
    delete urlDatabase[id];
    res.redirect("/urls");
  }
});




//redirect route
app.get("/u/:id", (req, res) => {
  const shortId = req.params.id;
  //if the shortId exists in our urlDatabase, then set its longURL & redirect user to the page
  if (urlDatabase[shortId]) {
    const longURL = urlDatabase[shortId].longURL;
    res.redirect(longURL);
  } else {
    res.status(404).send(`This url does not exist, please enter a valid url!`);
  }
});



//get route for signup
app.get("/register", (req, res) => {
  //redirecting user back to /urls if they already logged
  if (req.session.user_id) {
    res.redirect("/urls");
    return;
  }
  //else, sending user to register page
  res.render("user_register", {user: null});
});



//newUser signup route
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const msg1 = "Please enter a valid password or email";
  const msg2 = "email already exists, please enter a valid email";

  //Sending error msg if user enters an empty string
  if (!email || !password) {
    res.status(400).send(msg1);
    return;
  }
  
  //checking if the user already exists in the users database
  if (findUser(email)) {
    res.status(400).send(msg2);
    return;
  }

  //setting a new user object
  const newUser = {id, email, hashedPassword};
  users[id] = newUser;
  // setting an encrypted cookie with users id
  req.session.user_id = id;
  res.redirect("/urls");
});



//get route for userlogin
app.get("/login", (req, res) => {
  // check if encrypted cookie is already set for user
  if (req.session.user_id) {
    res.redirect("/urls");
    return;
  }
  res.render("user_login", {user: null});
});



//post route for userlogin
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUser(email);


  if (!password || !email || !user) {
    res.send(`User not found, please enter a valid password or email!`);
    return;
  }

  //checking if users plain text password is equal to hashedPassword
  const passwordCheck = bcrypt.compareSync(req.body.password, user.hashedPassword);

  if (user && passwordCheck) {
    // set cookie for user, using their id
    req.session.user_id = user.id;
    res.redirect("/urls");
    return;
  }
  //error message if user enter wrog email or password
  res.status(403).send(`Please enter a valid email or password`);
});



//user logout route
app.post("/logout", (req, res) => {
  //clearing cookie when user signout
  req.session = null;
  res.redirect("/login");
});



app.listen(PORT, () => {
  console.log(`Example app listening on PORT ${PORT}!`);
});