import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

   
    const user = await User.create({ username, email, password: hashedPassword });

    res.status(201).json({
      message: "User signed up successfully",
      user: { _id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("Signup Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

   
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

   
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

   
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      message: "Login successful",
      token,
      user: { _id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};


export const profile = async (req, res) => {
  try {

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized. Invalid token." });
    }

    res.status(200).json({
      user: {
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
      },
    });
  } catch (err) {
    console.error("Profile Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
