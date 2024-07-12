import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images AND avatar
  // upload them to cloudinary
  // create user object(NoSql database so creating object) - entry in db
  // remove password & refresh token from response
  // check for user creation
  // return response

  const { fullname, email, username, password} = req.body;

  console.log("email", email);
});

export { registerUser };
