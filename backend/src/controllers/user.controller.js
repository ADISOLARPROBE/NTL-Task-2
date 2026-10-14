import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

// Helper function to generate short-lived Access Token (WebDevSimplified style)
const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            username: user.username,
            role: user.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
    );
};

// Middleware: Verify JWT Access Token (WebDevSimplified authenticateToken pattern)
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer <TOKEN>

    if (token == null) {
        return res.status(401).json({ message: "Access token required" });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired access token" });
        }
        req.user = user;
        next();
    });
};

// Middleware: Role-Based Access Control (Admin vs User)
const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Access denied: Admin privileges required"
            });
        }
        next();
    };
};

// 1. Register User
const registerUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Basic input validation
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are important!" });
        }

        if (!email.includes("@")) {
            return res.status(400).json({ message: "Please provide a valid email address" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        if (role && !["user", "admin"].includes(role)) {
            return res.status(400).json({ message: "Role must be either 'user' or 'admin'" });
        }

        // Check if user exists already
        const existing = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }]
        });
        if (existing) {
            return res.status(400).json({ message: "User already exists!" });
        }

        // Create user (password is hashed automatically by user.model.js pre-save hook)
        const user = await User.create({
            username,
            email: email.toLowerCase(),
            password,
            role: role || "user"
        });

        res.status(201).json({
            message: "User registered!",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// 2. Login User & Issue Access + Refresh Tokens
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Compare hashed passwords
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" }
        );

        // Save refresh token in DB
        user.refreshToken = refreshToken;
        await user.save();

        // Send refresh token as HttpOnly cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(200).json({
            message: "User Logged in",
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// 3. Refresh Access Token (using HttpOnly cookie or request body token)
const refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken || req.body?.token;
        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token required" });
        }

        const user = await User.findOne({ refreshToken });
        if (!user) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: "Expired or invalid refresh token" });
            }
            const accessToken = generateAccessToken(user);
            res.status(200).json({ accessToken });
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// 4. Logout User (invalidate refresh token & clear cookie)
const logoutuser = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken || req.body?.token;

        if (refreshToken) {
            await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
        } else if (req.body?.email) {
            await User.findOneAndUpdate(
                { email: req.body.email.toLowerCase() },
                { refreshToken: null }
            );
        }

        res.clearCookie("refreshToken", {
            httpOnly: true,
            sameSite: "strict"
        });

        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

export {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutuser,
    authenticateToken,
    authorizeRole
};
