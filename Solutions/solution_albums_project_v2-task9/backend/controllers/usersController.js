import createError from "http-errors";
import User from "../models/user.js";

// ==============================================
// GET the logged in user's data
// ==============================================

export const getUserData = async (req, res, next) => {
    // Take the :id parameter from the request path ("/users/:id/albums")
    const userId = req.params.id;

    // Try to find a user in the "users" collection with the same id
    // If you find a user object with the correct id, make a copy and put it in the "foundUser" variable
    // If you do not find the user, "foundUser" = undefined
    let foundUser; 
    
    try {
       foundUser = await User.findById(userId);
    } catch {
        return next(createError(500, "Couldn't query database. Please try again"));
    }

    // If a user was found with the same id as the :id parameter...
    if (foundUser) {
        // Send in the response back to the frontend:
        //  - firstName
        //  - list of albums
        const userData = {
            firstName: foundUser.firstName,
            albums: foundUser.albums
        }

        res.json(userData);
    
    // If no user was found with the same id as the :id parameter...
    // Create an error object with a relevant message and statusCode, and pass it to the error handling middleware
    } else {
        next(createError(404, "User could not be found"));
    }
}

// =======================================================
// POST a new album to the logged in user's "albums" list
// =======================================================

export const postAlbum = async (req, res, next) => {
    // * Step 1: Grab the album data from the request body
    const newAlbum = req.body;

    // Take the user's id from the "id" parameter of their request URL
    const userId = req.params.id;

    // * Step 2A - Find the user who sent the request in our "users" collection.
    let foundUser; 
    
    try {
        foundUser = await User.findById(userId);
    } catch {
        return next(createError(500, "Query could not be completed. Please try again"));
    }

    // * Step 2B - Search in the user's array of albums to see if they already have the new album there
    // If foundAlbum = undefined, the new album is not already in their "albums" array - we can create it!
    const foundAlbum = foundUser.albums.find(album => {
        return album.band.toLowerCase() === newAlbum.band.toLowerCase()
            && album.albumTitle.toLowerCase() === newAlbum.albumTitle.toLowerCase()
            && album.albumYear == newAlbum.albumYear
    })

    // * Step 3A - If the user does not already have the new album in their "albums" array...
    if (!foundAlbum) {
        let updatedUser;

        try {
            //                                        (1) id  (2) update                      (3) options
            updatedUser = await User.findByIdAndUpdate(userId, { $push: { albums: newAlbum }}, { new: true, runValidators: true })
        } catch {
            return next(createError(500, "User could not be updated. Please try again"));
        }

        // * ... and send back the updated array of albums to the frontend
        res.status(201).json(updatedUser.albums);
    
    // If the new album is already in the user's "albums" array...
    // Create an error object with a relevant message and statusCode, and pass it to the error handling middleware    
    } else {
        next(createError(409, "The album already exists in your collection!"));
    }
}

// ==========================================================
// DELETE all albums from the logged in user's "albums" list
// ==========================================================

export const deleteAlbums = async (req, res, next) => {
    const userId = req.params.id;

    // * Task 6 - Find the user who sent the request...
    // * ... and update their "albums" array to be an empty arry
    let updatedUser;

    try {
        updatedUser = await User.findByIdAndUpdate(userId, { albums: [] }, { new: true, runValidators: true })
    } catch {
        return next(createError(500, "User could not be updated. Please try again"));
    }
    
    res.json(updatedUser.albums);
}

// ==========================================================
// DELETE a single album from the logged in user's "albums" list
// ==========================================================

export const deleteAlbum = async (req, res, next) => {
    const userId = req.params.id;
    const albumId = req.params.albumId;

    console.log("User id:", userId);
    console.log("Album id:", albumId);

    let updatedUser;

    try {
        // findByIdAndUpdate = change part of the document
        // findByIdAndRemove = delete the full document!
        updatedUser = await User.findByIdAndUpdate(userId, { $pull: { albums: { _id: albumId }}}, { new: true, runValidators: true })
    } catch {
        return next(createError(500, "User could not be updated. Please try again"));
    }

    res.json(updatedUser.albums);
}

// ==========================================================
// DELETE a user from the "users" collection
// ==========================================================

export const deleteUser = async (req, res, next) => {
    const userId = req.params.id;

    try {
        await User.findByIdAndRemove(userId);
    } catch {
        return next(createError(500, "User could not be deleted. Please try again"));
    }

    res.json({ message: "Your account has been successfully deleted. Come back soon!" });
}