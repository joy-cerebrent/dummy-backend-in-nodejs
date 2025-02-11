import bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { generateAccessToken, generateRefreshToken, verifyAccessToken } from '../utils/jwtUtils.js';

const ACCESS_TOKEN_SECRET = 'your-access-token-secret';
const REFRESH_TOKEN_SECRET = 'your-refresh-token-secret';

const __dirname = path.resolve();
const authDataPath = path.resolve(__dirname, 'data', 'authData.json');

const readData = () => {
  try {
    const data = fs.readFileSync(authDataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { users: [] };
  }
};

const writeData = (data) => {
  fs.writeFileSync(authDataPath, JSON.stringify(data, null, 2), 'utf8');
};

export const signup = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const data = readData();
  const existingUser = data.users.find(user => user.email === email);

  if (existingUser) {
    return res.status(400).json({ message: 'Email already exists.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { email, password: hashedPassword };

  data.users.push(newUser);
  writeData(data);

  return res.status(201).json({ message: 'User created successfully!' });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const data = readData();
  const user = data.users.find(user => user.email === email);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const accessToken = generateAccessToken({ email });
  const refreshToken = generateRefreshToken({ email });

  res.status(200).json({
    message: 'Login successful!',
    email,
    accessToken,
    refreshToken
  });
};

export const validateToken = (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token is required.' });
  }

  try {
    // const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    const decoded = verifyAccessToken(token);
    res.status(200).json({
      message: 'Token is valid.',
      email: decoded.email,
    });
  } catch (error) {
    console.error(error)
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

export const logout = (req, res) => {
  res.status(200).json({ message: 'Logout successful!' });
};