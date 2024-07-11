import bcrypt from 'bcrypt';
import prisma from '../config/db.js';
import generateToken from '../utils/generateToken.js';

// Register a new user
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await prisma.user.findUnique({ where: { email } });

  if (userExists) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  if (user) {
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user.id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// Authenticate user
const authUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user.id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  const user = req.user;
  res.json(user);
};

// Update user profile
const updateUserProfile = async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });

  if (user) {
    user.name = req.body.name || user.name;
    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: user,
    });

    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      token: generateToken(updatedUser.id),
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });

  if (user) {
    await prisma.user.delete({ where: { id: user.id } });
    res.json({ message: 'User deleted' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

export { registerUser, authUser, getUserProfile, updateUserProfile, deleteUser };
