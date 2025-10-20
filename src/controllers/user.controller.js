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