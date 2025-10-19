import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import http from 'http';
import router from './src/routes/auth.route.js';
import {io} from './src/config/socket.io.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT;
const URI = process.env.MONGO_URI;
const Server = http.createServer(app);

//routes
app.use(express.json());
app.use('/api/auth', router);

//socket.io integration
io.attach(Server);

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
Server.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});