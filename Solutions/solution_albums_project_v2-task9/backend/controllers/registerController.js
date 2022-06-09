// * Task 1, Step 6
import User from "../models/user.js";

export const registerPost = async (req, res, next) => {
    const { username, password, firstName, lastName, emailAddress } = req.body;
    
    // * Task 1, Step 7 starts here...
    let foundUsername;
    
    try {
        foundUsername = await User.findOne({ username: username });
    } catch {
        const err = new Error("Could not query database. Please try again");
        err.statusCode = 500;
        return next(err);
    }

    // If there is no user in the db with the username received from the frontend
    if (!foundUsername) {
        // Create a new user based on data received from req.body
        const newUser = new User({
            username: username,
            password: password,
            firstName: firstName,
            lastName: lastName,
            emailAddress: emailAddress,
            albums: []
        });
    
        try {
            await newUser.save();   // We could get a validation error here if the schema is not fulfilled
        } catch {
            const err = new Error("User could not be created. Please try again");
            err.statusCode = 500;
            return next(err);
        }
    
        // Send a response to the client containing the new user object in a JSON format
        res.status(201).json({ id: newUser._id });
    
    // If there is already a user in the db with the username received from the frontend
    // Create an error object with a relevant message and statusCode, and pass it to the error handling middleware
    } else {
        const err = new Error("Sorry, this username has been taken. Please choose another");
        err.statusCode = 409;   // Conflict
        next(err);
    }    
}