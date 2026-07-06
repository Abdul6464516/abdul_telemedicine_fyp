const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const LoginLog = require('../models/LoginLog');
const axios = require('axios');
const UAParser = require('ua-parser-js');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

async function register(req, res) {
  try {
    const { fullName, email, username, password, role, city,
      
      // Patient fields
      age, gender, phone, medicalHistory,
      // Doctor fields
      specialty, qualifications, yearsOfExperience, availability, chargesPerSession
    } = req.body;
    console.log("req body",req.body);
    if (!fullName || !email || !username || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(409).json({ message: 'Email or username already in use' });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const userData = { fullName, email, username, password: hash, role, city, phone };

    if (role === 'patient') {
      userData.age = age;
      userData.gender = gender;
      userData.medicalHistory = medicalHistory;
      userData.verificationStatus = 'pending';
    }

    if (role === 'doctor') {
      userData.gender = gender;
      userData.specialty = specialty;
      userData.qualifications = qualifications;
      userData.yearsOfExperience = yearsOfExperience;
      userData.availability = availability;
      userData.chargesPerSession = chargesPerSession;
      userData.verificationStatus = 'pending';
    }

    if (role === 'admin') {
      userData.verificationStatus = 'verified';
    }

    const user = new User(userData);
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    // Return full user details (excluding password)
    const userResponse = user.toObject();
    delete userResponse.password;
    res.status(201).json({ token, user: userResponse });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Helper function to get client's real IP address
function getClientIP(req) {
  // Check for IP from proxy headers (for production/deployed apps)
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  // Check other proxy headers
  if (req.headers['x-real-ip']) {
    return req.headers['x-real-ip'];
  }
  
  // Fall back to direct connection IP
  return req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'Unknown';
}

async function login(req, res) {
  try {
    const { identifier, password } = req.body; 
    if (!identifier || !password) return res.status(400).json({ message: 'Missing credentials' });
    const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
    if (!user) {
      // Log failed login attempt
      try {
        const ipAddress = getClientIP(req);
        const userAgent = req.get('user-agent') || 'Unknown';
        const location = await getLocationFromIP(ipAddress);
        const deviceInfo = parseUserAgent(userAgent);

        await LoginLog.create({
          userId: null,
          username: identifier,
          email: identifier,
          userRole: 'unknown',
          ipAddress,
          userAgent,
          location,
          deviceInfo,
          loginStatus: 'failed',
          failureReason: 'User not found',
          isRiskySuspicious: false,
        });
      } catch (logErr) {
        console.error('Error logging failed login:', logErr);
      }
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      // Log failed login attempt
      try {
        const ipAddress = getClientIP(req);
        const userAgent = req.get('user-agent') || 'Unknown';
        const location = await getLocationFromIP(ipAddress);
        const deviceInfo = parseUserAgent(userAgent);

        await LoginLog.create({
          userId: user._id,
          username: user.username,
          email: user.email,
          userRole: user.role,
          ipAddress,
          userAgent,
          location,
          deviceInfo,
          loginStatus: 'failed',
          failureReason: 'Invalid password',
          isRiskySuspicious: false,
        });
      } catch (logErr) {
        console.error('Error logging failed login:', logErr);
      }
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Successful login - log the details
    try {
      const ipAddress = getClientIP(req);
      const userAgent = req.get('user-agent') || 'Unknown';
      const location = await getLocationFromIP(ipAddress);
      const deviceInfo = parseUserAgent(userAgent);

      // Check for suspicious activity
      const suspiciousFactors = await checkSuspiciousActivity(user._id, ipAddress, location);

      await LoginLog.create({
        userId: user._id,
        username: user.username,
        email: user.email,
        userRole: user.role,
        ipAddress,
        userAgent,
        location,
        deviceInfo,
        loginStatus: suspiciousFactors.length > 0 ? 'suspicious' : 'success',
        riskFactors: suspiciousFactors,
        isRiskySuspicious: suspiciousFactors.length > 0,
      });
    } catch (logErr) {
      console.error('Error logging successful login:', logErr);
      // Don't fail the login if logging fails
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    // Return full user details (excluding password)
    const userResponse = user.toObject();
    delete userResponse.password;
    res.json({ token, user: userResponse });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Helper function to get location from IP address
async function getLocationFromIP(ipAddress) {
  try {
    // Skip if it's localhost or private IP
    if (ipAddress === 'localhost' || ipAddress === '127.0.0.1' || ipAddress === '::1' || ipAddress === '::ffff:127.0.0.1' || ipAddress.startsWith('192.168') || ipAddress.startsWith('10.') || ipAddress.startsWith('172.')) {
      return {
        country: 'Local Network',
        city: 'Local',
        region: 'Local',
      };
    }

    // Try IP-API.com first
    try {
      const response = await axios.get(`https://ip-api.com/json/${ipAddress}`, {
        timeout: 5000,
        headers: {
          'User-Agent': 'NodeJS-App'
        }
      });
      if (response.data && response.data.status === 'success') {
        return {
          country: response.data.country || 'Unknown',
          city: response.data.city || 'Unknown',
          region: response.data.regionName || 'Unknown',
          latitude: response.data.lat || null,
          longitude: response.data.lon || null,
          isp: response.data.isp || null,
        };
      }
    } catch (apiErr) {
      // IP-API failed (rate limit, 403, etc) - use fallback
      console.warn(`IP-API.com failed (${apiErr.response?.status || apiErr.message}), using fallback`);
      
      // Fallback: Try ipify API
      try {
        const response = await axios.get(`https://geoip.tools/api/geoip/${ipAddress}`, {
          timeout: 5000
        });

        if (response.data) {
          return {
            country: response.data.country || 'Unknown',
            city: response.data.city || 'Unknown',
            region: response.data.region || 'Unknown',
            latitude: response.data.latitude || null,
            longitude: response.data.longitude || null,
            isp: null,
          };
        }
      } catch (fallbackErr) {
        console.warn(`Fallback API also failed: ${fallbackErr.message}`);
        // If both fail, return generic location
        return {
          country: 'Unknown',
          city: 'Unknown',
          region: 'Unknown',
        };
      }
    }
  } catch (err) {
    console.warn('Error in getLocationFromIP:', err.message);
  }

  return {
    country: 'Unknown',
    city: 'Unknown',
    region: 'Unknown',
  };
}

// Helper function to parse user agent
function parseUserAgent(userAgent) {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  return {
    deviceType: result.device.type || 'desktop',
    browser: result.browser.name || 'Unknown',
    operatingSystem: result.os.name || 'Unknown',
  };
}

// Helper function to check for suspicious activity
async function checkSuspiciousActivity(userId, ipAddress, location) {
  const suspiciousFactors = [];

  try {
    // Check if this is a new IP address for the user
    const previousLogins = await LoginLog.findOne({
      userId,
      ipAddress: { $ne: ipAddress },
      loginStatus: 'success',
    }).sort({ loginTime: -1 });

    if (previousLogins === null && ipAddress !== 'localhost' && ipAddress !== '127.0.0.1') {
      suspiciousFactors.push('new_device_or_location');
    }

    // Check if login from unusual location
    if (previousLogins && previousLogins.location.country && location.country) {
      if (previousLogins.location.country !== location.country) {
        suspiciousFactors.push('unusual_location');
      }
    }

    // Check if login at unusual time
    const now = new Date();
    const hour = now.getHours();
    if (hour < 6 || hour > 23) {
      suspiciousFactors.push('unusual_time');
    }

    // Check for rapid login attempts from different IPs
    const recentLogins = await LoginLog.countDocuments({
      userId,
      loginTime: { $gte: new Date(Date.now() - 10 * 60 * 1000) }, // Last 10 minutes
    });

    if (recentLogins > 3) {
      suspiciousFactors.push('rapid_login_attempts');
    }
  } catch (err) {
    console.error('Error checking suspicious activity:', err);
  }

  return suspiciousFactors;
}

async function me(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Get current user's login history
async function getLoginHistory(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const loginHistory = await LoginLog.find({ userId })
      .select('-userAgent -riskFactors') // Exclude sensitive fields
      .sort({ loginTime: -1 })
      .limit(50);

    res.json({ loginHistory, count: loginHistory.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Get login statistics for current user
async function getLoginStats(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const totalLogins = await LoginLog.countDocuments({ userId, loginStatus: 'success' });
    const failedLogins = await LoginLog.countDocuments({ userId, loginStatus: 'failed' });
    const suspiciousLogins = await LoginLog.countDocuments({ userId, isRiskySuspicious: true });

    const lastLogin = await LoginLog.findOne({ userId, loginStatus: 'success' })
      .sort({ loginTime: -1 });

    const uniqueDevices = await LoginLog.distinct('deviceInfo.deviceType', { userId });
    const uniqueLocations = await LoginLog.distinct('location.country', { userId });

    res.json({
      totalLogins,
      failedLogins,
      suspiciousLogins,
      lastLogin,
      uniqueDevicesCount: uniqueDevices.length,
      uniqueLocationsCount: uniqueLocations.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Admin: Get all login logs (requires admin role)
async function getAllLoginLogs(req, res) {
  try {
    const userId = req.user && req.user.id;
    const user = await User.findById(userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { limit = 100, page = 1, userId: filterUserId } = req.query;

    let query = {};
    if (filterUserId) query.userId = filterUserId;

    const loginLogs = await LoginLog.find(query)
      .populate('userId', 'fullName email username role')
      .sort({ loginTime: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await LoginLog.countDocuments(query);

    res.json({
      loginLogs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Admin: Get suspicious login attempts
async function getSuspiciousLogins(req, res) {
  try {
    const userId = req.user && req.user.id;
    const user = await User.findById(userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const suspiciousLogins = await LoginLog.find({ isRiskySuspicious: true })
      .populate('userId', 'fullName email username role')
      .sort({ loginTime: -1 })
      .limit(100);

    res.json({ suspiciousLogins, count: suspiciousLogins.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { register, login, me, getLoginHistory, getLoginStats, getAllLoginLogs, getSuspiciousLogins, getLocationFromIP, parseUserAgent, checkSuspiciousActivity };
