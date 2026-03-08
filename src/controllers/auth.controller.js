const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/* ==============================
   REGISTER USER
============================== */

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      }
    });

    // Auto-create Judge profile if registering as judge
    if (role === 'judge') {
      await prisma.judge.create({
        data: { userId: user.id, expertise: 'General' }
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Return shape that frontend expects: { token, user }
    res.status(201).json({
      token,
      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


/* ==============================
   LOGIN USER
============================== */

exports.login = async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.role === 'sponsor') {
      const sponsorProfile = await prisma.sponsor.findFirst({
        where: { contactEmail: user.email.toLowerCase() },
        select: { status: true, emailVerified: true },
      });

      if (!sponsorProfile) {
        return res.status(403).json({ message: 'Sponsor profile not found' });
      }

      if (!sponsorProfile.emailVerified) {
        return res.status(403).json({ message: 'Verify your sponsor email first' });
      }

      if (sponsorProfile.status !== 'approved') {
        return res.status(403).json({ message: 'Sponsor access pending admin approval' });
      }
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Return shape that frontend expects: { token, user }
    res.json({
      token,
      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ==============================
   VERIFY SPONSOR EMAIL
============================== */
exports.verifyEmail = async (req, res) => {
  try {
    const token = String(req.query?.token || req.body?.token || '').trim();
    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const sponsor = await prisma.sponsor.findFirst({
      where: { verificationToken: token },
    });

    if (!sponsor) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    if (!sponsor.verificationExpires || sponsor.verificationExpires < new Date()) {
      return res.status(400).json({ message: 'Verification token has expired' });
    }

    const updated = await prisma.sponsor.update({
      where: { id: sponsor.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationExpires: null,
        verificationStatus:
          sponsor.status === 'approved' ? 'approved' : 'email_verified_pending_admin',
      },
    });

    return res.json({
      message: 'Email verified successfully. Awaiting admin approval.',
      sponsorId: String(updated.id),
      status: updated.status,
      verificationStatus: updated.verificationStatus,
      emailVerified: updated.emailVerified,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
