import { User } from "../models/user.models.js";

const registerUser = async (req, res) => {
    try {
        const { username, password, email } = req.body;

        //basic validation

        if (!username || !password || !email) {
            return res.status(400).json({ message: "Please fill all fields" });
        }

        //check if user already exists
        const existing  = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(400).json({ message: "User already exists" });
        }

        // create new user
        // small u- single user, big U- whole user base

        const newUser = await User.create({
            username,
            password,
            email: email.toLowerCase(),
            loggedin: false,
        });

        res.status(201).json({ message: "User registered successfully", user: newUser._id, email: newUser.email, username: newUser.username });

    } catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
};

export { registerUser };
