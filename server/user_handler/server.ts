import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AppDataSource from './data-source.js';
import { User } from './entities/User.js';
import { body, validationResult } from 'express-validator';

const app = express();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// Service for handling authentication and user registration
const userRepository = AppDataSource.getRepository(User);

async function register(email: string, username: string, password: string, role = 'user', address: string) {
  const existingEmail = await userRepository.findOneBy({ email });
  if (existingEmail) throw new Error('Email already exists');

  const existingUsername = await userRepository.findOneBy({ username });
  if (existingUsername) throw new Error('Username already exists');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = userRepository.create({
    email,
    username,
    passwordHash,
    role: role as "admin" | "user",
    address
  });
  await userRepository.save(user);
  return { id: user.id, email: user.email, username: user.username, role: user.role, address: user.address };
}

async function login(identifier: string, password: string) {
  const user = await userRepository.findOneBy(
    identifier.includes('@') ? { email: identifier } : { username: identifier }
  );
  if (!user) throw new Error('Invalid credentials');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('Invalid credentials');

  const token = jwt.sign(
    { userId: user.id, email: user.email, username: user.username, role: user.role, address: user.address },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
  return { token };
}

function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; username: string; role: string; address: string };
    return decoded;
  } catch {
    return null;
  }
}

// Establish database connection
AppDataSource.initialize().then(async () => {
  console.log('📦 Database connected successfully');

  // Create two users on startup
  try {
    const user1 = await register('user1@example.com', 'user1', 'password123', 'user', '123 Main St');
    const user2 = await register('user2@example.com', 'user2', 'password123', 'admin', '456 Elm St');
    console.log('✅ Two users created successfully:', { user1, user2 });
  } catch (error) {
    console.error('❌ Failed to create initial users:', error);
  }
}).catch((error) => {
  console.error('❌ Database connection failed:', error);
});

app.use(cors({ origin: ['http://127.0.0.1:5500', 'http://localhost:8080'] }));
app.use(express.json());

// -------------------- USER REGISTRATION --------------------
app.post('/api/users/register',
  // Input validation middleware
  [
    body('email').isEmail().withMessage('Invalid email format'),
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('role').optional().isIn(['admin', 'user']).withMessage('Role must be either admin or user')
  ],
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, username, password, role, address } = req.body;
    try {
      const user = await register(email, username, password, role, address);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }
);

// -------------------- USER LOGIN --------------------
app.post('/api/users/login', async (req: Request, res: Response) => {
  const { identifier, password } = req.body;
  try {
    const token = await login(identifier, password);
    res.json(token);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// -------------------- GET ALL USERS --------------------
app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Error handling middleware
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof Error) {
    res.status(500).json({ error: err.message });
  } else {
    res.status(500).json({ error: 'An unknown error occurred' });
  }
});

app.listen(3006, () => console.log('🚀 User handler server running at http://localhost:3006'));
