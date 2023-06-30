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
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },

  "9sm5xk": {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  },

  "kjv123": {
    longURL: "http://www.facebook.com",
    userID: "user3",
  },

  "kjv456": {
    longURL: "http://www.yahoo.com",
    userID: "user3",
  },
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
  user3: {
    id: "user3",
    email: "car@gmail.com",
    password: "tata",
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
      result[key] = urlDatabase[key].longURL;
    }
  }

  return result;
};



//my urls page
app.get("/urls", (req, res) => {
  //user is signed in and their id is set as cookie
  const id = req.cookies.user_id;
  //if no cookie as been set with user id yet
  if (!id) {
    res.send(`Please login to view this page`);
  }

  const user = users[id];
  const templateVars = {urls: urlDatabase, user};
  res.render("urls_index", templateVars);
});



//post route for creating a new url
app.post("/urls", (req, res) => {
  //user is logged in and cookie is set
  const userId = req.cookies.user_id;

  //preventing user from creating new url if they are not logged in
  if (!userId) {
    res.send(`Please login to access this route`);
  }
  const longURL = req.body.longURL;
  const randomId = generateRandomString();

  //set a new urlDatabase for a user
  const newUrlDatabase = {longURL, userID: userId}
  urlDatabase[randomId] = newUrlDatabase;
  console.log(urlDatabase);
  //update the redirection URL
  res.redirect(`/urls/${randomId}`);
});



//create new url page
app.get("/urls/new", (req, res) => {
  const id = req.cookies.user_id;
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
  const userId = req.cookies.user_id;
  const user = users[userId];
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;
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
  const urlToDelete = req.params.id;

  //Checking if the url to be deleted exist in the urlDatabase
  if (urlDatabase[urlToDelete].longURL) {
    delete urlDatabase[urlToDelete];
  } else {
    res.send(`url not found`);
  }
  res.redirect("/urls");
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

  if (req.cookies.user_id) {
    res.redirect("/urls");
    return;
  }
  res.render("user_register", {user: null});
});



//newUser signup route
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const msg1 = "Please enter a valid password or email";
  const msg2 = "email already exists, please enter a valid email";

  if (!email || !password) {
    res.status(400).send(msg1);
    return;
  }
  
  if (findUser(email)) {
    res.status(400).send(msg2);
    return;
  }

  const newUser = {id, email, password};
  users[id] = newUser;
  res.cookie("user_id", id);
  res.redirect("/urls");
});



//get route for userlogin
app.get("/login", (req, res) => {
  // check if "user_id" cookie is already set
  if (req.cookies.user_id) {
    res.redirect("/urls");
    return;
  }
    res.render("user_login", {user: null});
});



//post route for userlogin
app.post("/login", (req, res) => {
  const {email, password} = req.body;
  const user = findUser(email);

  if (user && password === user.password) {
    // set cookie for user, using their id
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


// const urlsForUser = function(id) {
//   let result = {};
//   for (const keys in urlDatabase) {
//     if (keys.userID === id) {
//       result.url = keys.longURL;
//     }
//   }

//   console.log(result);
//   return result;
// };
// urlsForUser('aw48lW');