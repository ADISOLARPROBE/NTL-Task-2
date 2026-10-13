import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./database.js";

dotenv.config({ // Load environment variables from .env file

    path: './.env' // Specify the path to your .env file if it's not in the root directory from which file you need variables
});

const startServer = async () => {
    try {
        await connectDB(); // Connect to the database

        app.on("error", (error) => {
            console.error("Error occurred in the application:", error);
            throw error; // Rethrow the error to be caught by the outer try-catch   
        });

        app.listen(process.env.PORT || 8000, () => {
            console.log(`server is running on port:
            ${process.env.PORT}`);
        });

    } catch (error) {
        console.log('MongoDB connection failed', error);
    }
}

startServer();
