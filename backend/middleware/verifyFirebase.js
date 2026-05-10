import 'dotenv/config';
import admin from 'firebase-admin';

let firebaseInitialized = false;

if (process.env.FIREBASE_SERVICE_ACCOUNT && process.env.FIREBASE_SERVICE_ACCOUNT.trim().startsWith('{')) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    });
    firebaseInitialized = true;
    console.log('✅ Firebase Admin initialized');
  } catch (err) {
    console.warn('⚠️  Firebase Admin init failed — falling back to DEV_AUTH_BYPASS mode');
  }
} else {
  console.warn('⚠️  No FIREBASE_SERVICE_ACCOUNT set — running in DEV_AUTH_BYPASS mode');
}

// Helper: decode a Firebase JWT without cryptographic verification (dev/hackathon mode)
function decodeFirebaseJwt(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    return {
      uid: payload.user_id || payload.sub,
      email: payload.email || '',
      name: payload.name || payload.email?.split('@')[0] || 'User',
    };
  } catch {
    return null;
  }
}

export async function verifyFirebase(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split('Bearer ')[1];

  if (!token) return res.status(401).json({ error: 'No token provided' });

  // DEV BYPASS: accept dev tokens AND decode real Firebase JWTs without verification
  if (process.env.DEV_AUTH_BYPASS === 'true') {
    // Dev token format: "dev-<uid>"
    if (token.startsWith('dev-')) {
      req.user = { uid: token.slice(4), email: 'guest@traveloop.com', name: 'Guest User' };
      return next();
    }
    // Demo token for the seeded demo user
    if (token === 'demo') {
      req.user = { uid: 'demo-user-001', email: 'demo@traveloop.com', name: 'Alex Rivera' };
      return next();
    }
    // Try to decode a real Firebase JWT (without cryptographic verification — ok for hackathon)
    const decoded = decodeFirebaseJwt(token);
    if (decoded && decoded.uid) {
      req.user = decoded;
      return next();
    }
  }

  // Full Firebase verification (production mode)
  if (!firebaseInitialized) {
    return res.status(401).json({ error: 'Firebase not configured. Set FIREBASE_SERVICE_ACCOUNT or DEV_AUTH_BYPASS=true' });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = { uid: decoded.uid, email: decoded.email, name: decoded.name };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
