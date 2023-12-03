const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');



const registerUser = async (req, res) => {
  try {
    const { name, username, bio, age, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      username,
      bio,
      age,
      password: hashedPassword,
    });
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    await user.save();

    res.status(201).json({ message: 'Account created successfully', user });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }


    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    if (user.blacklisted.status) {
      user.blacklisted.status = false;
      user.blacklisted.token = token;
      await user.save();
    }

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const updateUser = async (req, res) => {
  try {
    if (req.user.blacklisted.status) {
      return res.status(401).json({ error: 'Token is blacklisted. Cannot update user details.' });
    }

    const { name, bio, age } = req.body;
    const userId = req.user._id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!req.user.blacklisted.status) {
      const updatedUser = await User.findByIdAndUpdate(userId, { name, bio, age }, { new: true });
      res.json({ message: 'User details updated successfully', user: updatedUser });
    } else {
      res.status(401).json({ error: 'Token is blacklisted. Cannot update user details.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};




  const resetPassword = async (req, res) => {
    try {

      if (req.user.blacklisted.status) {
        return res.status(401).json({ error: 'Token is blacklisted. Cannot reset password.' });
      }

      const { username, new_password } = req.body;
  
      const user = await User.findOne({ username });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
   
      const hashedPassword = await bcrypt.hash(new_password, 10);
  

      user.password = hashedPassword;
      await user.save();
  
      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

const logoutUser = async (req, res) => {
  try {


    const user = req.user;

    if (user.blacklisted.status) {
      return res.status(401).json({ error: 'Token already blacklisted' });
    }

    user.blacklisted.status = true;
     
    await user.save();



    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
 

  const deleteUser = async (req, res) => {
    try {
      const { password } = req.body;
      const userId = req.user._id;
  
      const user = await User.findById(userId);
  
      const passwordMatch = await bcrypt.compare(password, user.password);
  
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid password' });
      }
     
      if (userId.toString() !== req.params.userId) {
        return res.status(403).json({ error: 'Forbidden: You do not have permission to delete this account' });
      }
   
      await User.findByIdAndDelete(userId);
  
      res.json({ message: 'Account deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  
 
  module.exports = { registerUser, loginUser, updateUser, resetPassword, logoutUser, deleteUser};
  

  


