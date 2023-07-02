// Function to find a user by email
const getUserByEmail = function(userEmail, users) {
  let currentUserObj;

  for (const user in users) {
    if (users[user]["email"] === userEmail) {
      currentUserObj = users[user];
      return currentUserObj;
    }
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



module.exports = { getUserByEmail, generateRandomString };