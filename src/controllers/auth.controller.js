const {PrismaClient} = require('@prisma/client')
const bcrypt = require('bcrypt')
const generateToken = require('../utils/jwt')
const prisma = require('../prismaClient')


exports.register = async (req, res) => {
  const { email, password, name } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return res.status(400).json({ message: 'User exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: { email, password: hashedPassword, name },
  });

  const token = generateToken(newUser);
  res.json({ user: newUser, token });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

  const token = generateToken(user);
  res.json({ user, token });
};

