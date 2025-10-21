import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Auth failed: Missing or malformed Authorization header");
      return res.status(401).json({ message: "Authorization header missing or malformed" });
    }

    const token = authHeader.split(" ")[1];
    
    if (!token) {
      console.log("Auth failed: Token is empty");
      return res.status(401).json({ message: "Token is required" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        console.log(`Auth failed: User not found for ID ${decoded.id}`);
        return res.status(404).json({ message: "User not found" });
      }

      req.user = user;
      next();
    } catch (tokenError) {
      console.error("Token verification error:", tokenError.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    return res.status(500).json({ message: "Authentication error" });
  }
};
