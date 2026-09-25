import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { User } from '../models/User.js';
import { isMongoConnected } from '../config/db.js';
import { memoryStore } from '../config/memoryStore.js';
import bcrypt from 'bcryptjs';

// Cookie options for secure HttpOnly session storage
export const cookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

function generateToken(id) {
  return jwt.sign({ id: String(id) }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

function sanitizeUser(user) {
  return {
    id: user._id || user.id,
    name: user.name,
    email: user.email,
    target_role: user.target_role || 'Frontend Developer',
    experience_level: user.experience_level || 'Entry Level',
    createdAt: user.createdAt,
  };
}

export async function register(req, res, next) {
  try {
    const { name, email, password, target_role, experience_level } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Check existing
    if (isMongoConnected()) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists.',
        });
      }

      const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        target_role: target_role || 'Frontend Developer',
        experience_level: experience_level || 'Entry Level',
      });

      const token = generateToken(user._id);
      res.cookie('token', token, cookieOptions);

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        token,
        user: sanitizeUser(user),
      });
    } else {
      const existing = memoryStore.findUserByEmail(email);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists.',
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = memoryStore.saveUser({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        target_role: target_role || 'Frontend Developer',
        experience_level: experience_level || 'Entry Level',
      });

      const token = generateToken(user._id);
      res.cookie('token', token, cookieOptions);

      return res.status(201).json({
        success: true,
        message: 'Registration successful (In-Memory)',
        token,
        user: sanitizeUser(user),
      });
    }
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    let user = null;
    let isMatch = false;

    if (isMongoConnected()) {
      user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
      if (user) {
        isMatch = await user.matchPassword(password);
      }
    } else {
      user = memoryStore.findUserByEmail(email);
      if (user) {
        isMatch = await bcrypt.compare(password, user.password);
      }
    }

    if (!user || !isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user._id || user.id);
    res.cookie('token', token, cookieOptions);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
}

export function logout(req, res) {
  res.clearCookie('token', {
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
  });
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
}

export function getMe(req, res) {
  return res.status(200).json({
    success: true,
    user: sanitizeUser(req.user),
  });
}

export async function updateProfile(req, res, next) {
  try {
    const { name, target_role, experience_level } = req.body;

    if (isMongoConnected()) {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (name) user.name = name.trim();
      if (target_role) user.target_role = target_role;
      if (experience_level) user.experience_level = experience_level;

      await user.save();
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: sanitizeUser(user),
      });
    } else {
      const user = memoryStore.findUserById(req.user.id || req.user._id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (name) user.name = name.trim();
      if (target_role) user.target_role = target_role;
      if (experience_level) user.experience_level = experience_level;

      memoryStore.saveUser(user);
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: sanitizeUser(user),
      });
    }
  } catch (err) {
    next(err);
  }
}
