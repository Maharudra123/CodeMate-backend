const validator = require("validator");
const validateSignupData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;

  if (!firstName || !lastName || !emailId || !password) {
    throw new Error("All fields are required");
  }
  if (!validator.isEmail(emailId)) {
    throw new Error("Invalid email");
  }
  if (!validator.isStrongPassword(password)) {
    throw new Error("Password is not strong enough");
  }
  if (firstName.length < 4 || firstName.length > 50) {
    throw new Error(
      "First name should be atleast 4 characters long and at max 50 characters long"
    );
  }
};

module.exports = { validateSignupData };
