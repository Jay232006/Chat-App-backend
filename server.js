import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import http from 'http';
import router from './src/routes/auth.route.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT;
const URI = process.env.MONGO_URI;
const server = http.createServer(app);

//routes
app.use(express.json());
app.use('/api/auth', router);

//MongoDB connection
mongoose.connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("MongoDB connected");
}).catch((err) => {
    console.error("MongoDB connection error:", err);
});

//server 
server.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});