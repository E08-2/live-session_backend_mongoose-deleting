import mongoose from "mongoose";

const { Schema } = mongoose;

// * Task 1, Step 4
const userSchema = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    emailAddress: { type: String, required: true },
    albums: [
        { 
            albumTitle: { type: String, required: true },
            band: { type: String, required: true },
            albumYear: { type: Number, required: true }
        }
    ]
});

// * Task 1, Step 5
const User = mongoose.model("User", userSchema);

export default User;