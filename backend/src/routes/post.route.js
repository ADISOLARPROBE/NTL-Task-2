import { Router } from 'express';
import { createPost, deletePost, getPosts, updatePost } from '../controllers/post.controller.js';
import { authenticateToken, authorizeRole } from "../controllers/user.controller.js";

const router = Router();

// Protected routes: any authenticated user ("user" or "admin") can create and view posts
router.route("/create").post(authenticateToken, createPost);
router.route("/getPosts").get(authenticateToken, getPosts);

// Restricted routes: only "admin" role can update or delete posts
router.route("/update/:id").patch(authenticateToken, authorizeRole("admin"), updatePost);
router.route("/delete/:id").delete(authenticateToken, authorizeRole("admin"), deletePost);

export default router;