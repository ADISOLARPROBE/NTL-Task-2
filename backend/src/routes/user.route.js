import { Router } from "express";
import {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutuser,
    authenticateToken,
    authorizeRole
} from "../controllers/user.controller.js";

const router = Router();

// Public routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/token").post(refreshAccessToken);
router.route("/logout").post(logoutuser);

// Protected route (any logged-in user or admin)
router.route("/profile").get(authenticateToken, (req, res) => {
    res.status(200).json({
        message: "Protected profile data accessed successfully",
        user: req.user
    });
});

// Admin-only route (Role-Based Access Control)
router.route("/admin").get(authenticateToken, authorizeRole("admin"), (req, res) => {
    res.status(200).json({
        message: "Welcome Admin! You have access to this restricted route.",
        user: req.user
    });
});

export default router;
