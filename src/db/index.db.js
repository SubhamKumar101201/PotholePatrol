import mongoose from "mongoose";



const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_HOST}`, {
            user: process.env.MONGO_USER_NAME,
            pass: process.env.MONGO_USER_PASSWORD,
            dbName: process.env.DB_NAME,
            retryWrites: true,
            w: "majority",
        });

        console.log(
            `✅ MongoDB connected ➜ host: ${process.env.MONGO_HOST} | db: ${process.env.DB_NAME}`
        );
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error.message);
        process.exit(1); // stop the app if DB is unreachable
    }
}

export default connectDB