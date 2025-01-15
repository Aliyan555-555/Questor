import mongoose from "mongoose";

const connectToMongodb = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            // useCreateIndex: true,
        });
        console.log(`MongoDB connected: ${connection.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // Exit the process with a failure
    }
};

export default connectToMongodb;
