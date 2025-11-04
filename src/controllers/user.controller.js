import User from '../models/user.model.js';

export async function getUsers(req, res) {
  try {
    // return only _id and username (no sensitive fields)
    const users = await User.find({}, 'username').lean();
    res.json(users);
  } catch (err) {
    console.error('getUsers error', err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function getMe(req, res) {
  try {
    const me = await User.findById(req.user._id).select('-password');
    if (!me) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user: me });
  } catch (err) {
    console.error('getMe error', err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function updateProfile(req, res) {
  try {
    const { username, email, phone, location, bio } = req.body;
    const userId = req.user._id;

    // Check if email is already taken by another user
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: "Email is already in use" });
      }
    }

    // Check if username is already taken by another user
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: "Username is already taken" });
      }
    }
    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        username: username || req.user.username,
        email: email || req.user.email,
        phone,
        location,
        bio
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (err) {
    console.error('updateProfile error', err);
    res.status(500).json({ message: "Fill correct details to update Profile :)", error: err.message });
  }
}