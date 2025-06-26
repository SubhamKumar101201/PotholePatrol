import { app } from "./app.js";
import connectDB from "./db/index.db.js";



connectDB()
    .then(() => {
        app.on('error', (error) => {
            console.log('Error :', error);
            throw err;
        })

        app.listen(process.env.PORT || 8080, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        })
    })
    .catch((error) => {

        console.log(`MongoDB connection failed => ${error}`);

    })