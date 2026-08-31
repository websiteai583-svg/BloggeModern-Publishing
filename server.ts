import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { getDb, saveDatabase, logActivity, initDatabase } from "./server/db";
import { sanitizeHtml, sanitizeCss } from "./server/sanitizer";

dotenv.config();

// Environment & Production Validation
const isProduction = process.env.NODE_ENV === "production";
const APP_URL = (process.env.APP_URL || "https://blogge.io").replace(/\/+$/, '');
const RESEND_API_KEY = (process.env.RESEND_API_KEY || "").trim();
const EMAIL_FROM = (process.env.EMAIL_FROM || "Blogge <no-reply@blogge.io>").trim();
const FIREBASE_PROJECT_ID = (process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || "").trim();

// Startup Validation for Production Mode
function validateProductionEnvironment(): void {
  const errors: string[] = [];

  if (isProduction) {
    if (!process.env.ADMIN_EMAIL || process.env.ADMIN_EMAIL.trim().length === 0) {
      errors.push("ADMIN_EMAIL is required in production mode.");
    }
    if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.trim().length === 0) {
      errors.push("SESSION_SECRET is required in production mode.");
    }
    if (!FIREBASE_PROJECT_ID) {
      errors.push("FIREBASE_PROJECT_ID is required in production mode.");
    }
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.trim().length === 0) {
      errors.push("GEMINI_API_KEY is required in production mode.");
    }
    if (!process.env.ALLOWED_ORIGINS || process.env.ALLOWED_ORIGINS.trim().length === 0) {
      errors.push("ALLOWED_ORIGINS is required in production mode.");
    }
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.trim().length === 0) {
      errors.push("RESEND_API_KEY is required in production mode for transactional email delivery.");
    }
    if (!process.env.EMAIL_FROM || process.env.EMAIL_FROM.trim().length === 0) {
      errors.push("EMAIL_FROM is required in production mode.");
    }
    if (!process.env.APP_URL || process.env.APP_URL.trim().length === 0) {
      errors.push("APP_URL is required in production mode.");
    }
  }

  if (errors.length > 0) {
    console.error("==================================================");
    console.error("FATAL: PRODUCTION CONFIGURATION VALIDATION FAILED:");
    errors.forEach(err => console.error(`  - ${err}`));
    console.error("==================================================");
    if (isProduction) {
      throw new Error(`Production Configuration Error: ${errors.join(", ")}`);
    }
  } else {
    console.log("[Config] Configuration validated successfully. Production Mode:", isProduction);
    if (RESEND_API_KEY) {
      console.log("[Email] Transactional email provider (Resend) active for password reset.");
    } else {
      console.log("[Email] Resend API key not set - development fallback mode active.");
    }
  }
}

validateProductionEnvironment();

// Session and Hashing secrets
const getSessionSecret = (): string => {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.trim().length > 0) {
    return process.env.SESSION_SECRET.trim();
  }
  if (isProduction) {
    throw new Error("FATAL: SESSION_SECRET environment variable is required in production mode.");
  }
  // In dev/container mode, persist secret to file so restarts don't invalidate sessions
  try {
    const secretPath = path.join(process.cwd(), 'data', '.session_secret');
    if (fs.existsSync(secretPath)) {
      const stored = fs.readFileSync(secretPath, 'utf8').trim();
      if (stored.length > 0) return stored;
    }
    const generated = crypto.randomBytes(32).toString("hex");
    fs.mkdirSync(path.dirname(secretPath), { recursive: true });
    fs.writeFileSync(secretPath, generated, 'utf8');
    return generated;
  } catch {
    return "blogge_dev_secret_key_2026_fixed";
  }
};

const SESSION_SECRET = getSessionSecret();
const ADMIN_API_KEY = (process.env.ADMIN_API_KEY || "").trim();

// Single Administrator Enforcement Helpers
const getAdminEmail = (): string => {
  return (process.env.ADMIN_EMAIL || "websiteai583@gmail.com").trim().toLowerCase();
};

const isEmailAdmin = (email?: string): boolean => {
  if (!email) return false;
  const adminEmail = getAdminEmail();
  return Boolean(adminEmail && email.trim().toLowerCase() === adminEmail);
};

// Rate limiting in-memory store
const rateLimitMap: Map<string, { count: number; resetAt: number }> = new Map();

function checkRateLimit(key: string, maxHits = 10, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxHits) {
    return false;
  }
  entry.count++;
  return true;
}

// Clean up stale rate limits every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitMap.entries()) {
    if (now > val.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, 10 * 60 * 1000);

// ==========================================
// CORS Configuration & Validation
// ==========================================
function getAllowedOrigins(): string[] {
  const envOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  if (!isProduction) {
    // In local development / preview sandbox, permit standard dev ports & localhost
    const devDefaults = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'capacitor://localhost',
      'https://localhost'
    ];
    return Array.from(new Set([...envOrigins, ...devDefaults]));
  }
  return envOrigins;
}

function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) {
    // Allow same-origin or non-browser server-to-server requests
    return true;
  }
  const allowed = getAllowedOrigins();
  
  if (!isProduction) {
    // Allow *.run.app and localhost in development environment
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
    if (origin.endsWith('.run.app')) return true;
    if (origin.startsWith('capacitor://') || origin.startsWith('http://localhost')) return true;
  }

  return allowed.includes(origin);
}

// Cryptographic public key cache for Firebase / Google token verification
let cachedGoogleCerts: Record<string, string> | null = null;
let certsExpiryTime = 0;

async function getGooglePublicCerts(): Promise<Record<string, string>> {
  const now = Date.now();
  if (cachedGoogleCerts && now < certsExpiryTime) {
    return cachedGoogleCerts;
  }
  try {
    const res = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
    if (res.ok) {
      const certs = await res.json();
      cachedGoogleCerts = certs;
      
      // Parse Cache-Control max-age from Google's server response
      const cacheControl = res.headers.get('cache-control');
      let maxAgeSeconds = 3600;
      if (cacheControl) {
        const match = cacheControl.match(/max-age=(\d+)/i);
        if (match && match[1]) {
          maxAgeSeconds = Math.max(60, parseInt(match[1], 10));
        }
      }
      certsExpiryTime = now + (maxAgeSeconds * 1000);
      return certs;
    }
  } catch (err) {
    console.warn("Failed to fetch Google public certs:", err);
  }
  return cachedGoogleCerts || {};
}

// Server-side strict verification for Google / Firebase ID Tokens
async function verifyGoogleOrFirebaseIdToken(idToken: string): Promise<{
  email: string;
  name?: string;
  avatar?: string;
} | null> {
  if (!idToken || typeof idToken !== 'string' || idToken.trim().length < 10) {
    return null;
  }

  const expectedProjectId = FIREBASE_PROJECT_ID;
  if (!expectedProjectId && isProduction) {
    console.error("[Auth] Missing required FIREBASE_PROJECT_ID in production mode.");
    return null;
  }

  // Cryptographic RS256 verification of Firebase JWT
  try {
    const parts = idToken.split('.');
    if (parts.length === 3) {
      const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
      const nowSeconds = Math.floor(Date.now() / 1000);

      // Validate expiration
      if (!payload.exp || payload.exp < nowSeconds) {
        return null;
      }

      // Validate issued-at
      if (payload.iat && payload.iat > nowSeconds + 300) {
        return null;
      }

      // Validate subject
      if (!payload.sub || typeof payload.sub !== 'string' || payload.sub.trim().length === 0) {
        return null;
      }

      // Strict Firebase Project / Audience Enforcement
      if (expectedProjectId) {
        const validAudience = payload.aud === expectedProjectId;
        const validIssuer = payload.iss === `https://securetoken.google.com/${expectedProjectId}`;
        if (!validAudience || !validIssuer) {
          return null; // Reject token from wrong Firebase project
        }
      } else if (isProduction) {
        return null;
      }

      // Validate email & email_verified
      if (!payload.email || (payload.email_verified !== true && payload.email_verified !== 'true')) {
        return null;
      }

      // Verify RS256 signature with Google x509 certs
      const kid = header.kid;
      if (kid) {
        const certs = await getGooglePublicCerts();
        const cert = certs[kid];
        if (cert) {
          const verifier = crypto.createVerify('RSA-SHA256');
          verifier.update(`${parts[0]}.${parts[1]}`);
          const isValid = verifier.verify(cert, parts[2], 'base64url');
          if (isValid) {
            return {
              email: payload.email.trim().toLowerCase(),
              name: payload.name || payload.email.split('@')[0],
              avatar: payload.picture
            };
          }
        }
      }
    }
  } catch (err) {
    console.warn("Firebase JWT cryptographic verification notice:", err);
  }

  return null;
}

// ==========================================
// Cloudinary Cloud Storage Configuration
// ==========================================
interface CloudinaryStatus {
  configured: boolean;
  mode: "separate_credentials" | "url" | "missing";
}

function getCloudinaryStatus(): CloudinaryStatus {
  const url = process.env.CLOUDINARY_URL?.trim();
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (url && url.length > 0) {
    return { configured: true, mode: "url" };
  }
  if (cloudName && apiKey && apiSecret) {
    return { configured: true, mode: "separate_credentials" };
  }
  return { configured: false, mode: "missing" };
}

function initCloudinary() {
  const status = getCloudinaryStatus();
  if (status.mode === "url") {
    cloudinary.config({ secure: true });
    console.log("[Cloudinary] Configured via CLOUDINARY_URL");
  } else if (status.mode === "separate_credentials") {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
      api_key: process.env.CLOUDINARY_API_KEY?.trim(),
      api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
      secure: true
    });
    console.log("[Cloudinary] Configured via separate credentials");
  } else {
    console.log("[Cloudinary] Cloud credentials not provided - local file storage fallback active");
  }
}

initCloudinary();

// Safe Server-Side Image Buffer & Magic Bytes Validation
function isValidImageBuffer(buffer: Buffer): { valid: boolean; format?: 'jpeg' | 'png' | 'webp' } {
  if (!buffer || buffer.length < 12) return { valid: false };

  // JPEG / JPG check: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { valid: true, format: 'jpeg' };
  }

  // PNG check: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4E &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0D &&
    buffer[5] === 0x0A &&
    buffer[6] === 0x1A &&
    buffer[7] === 0x0A
  ) {
    return { valid: true, format: 'png' };
  }

  // WEBP check: bytes 0-3 'RIFF' and bytes 8-11 'WEBP'
  const riff = buffer.toString('ascii', 0, 4);
  const webp = buffer.toString('ascii', 8, 12);
  if (riff === 'RIFF' && webp === 'WEBP') {
    return { valid: true, format: 'webp' };
  }

  return { valid: false };
}

// Multer Memory Storage Configuration for Multipart File Uploads
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/pjpeg'];
    const mime = (file.mimetype || '').toLowerCase();
    const originalName = (file.originalname || '').toLowerCase();
    const hasValidExt = /\.(jpe?g|png|webp)$/i.test(originalName);
    if (allowed.includes(mime) || hasValidExt) {
      cb(null, true);
    } else {
      cb(new Error("INVALID_FILE_FORMAT"));
    }
  }
});

// Strong production-safe PBKDF2-SHA512 password hashing (100,000 iterations)
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEYLEN = 64;
const PBKDF2_DIGEST = "sha512";

function hashPasswordStrong(password: string, salt: string): string {
  const derived = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST).toString("hex");
  return `pbkdf2_sha512$${PBKDF2_ITERATIONS}$${derived}`;
}

function verifyAndMigratePassword(password: string, user: any): boolean {
  if (!user || !user.passwordHash || !user.salt) return false;

  // New format: pbkdf2_sha512$100000$...
  if (typeof user.passwordHash === 'string' && user.passwordHash.startsWith(`pbkdf2_sha512$${PBKDF2_ITERATIONS}$`)) {
    const expected = hashPasswordStrong(password, user.salt);
    const expectedBuf = Buffer.from(expected);
    const actualBuf = Buffer.from(user.passwordHash);
    if (expectedBuf.length !== actualBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, actualBuf);
  }

  // Legacy format: PBKDF2-SHA256 1000 iterations
  const legacyHash = crypto.pbkdf2Sync(password, user.salt, 1000, 32, "sha256").toString("hex");
  const isLegacyMatch = typeof user.passwordHash === 'string' &&
    Buffer.from(legacyHash).length === Buffer.from(user.passwordHash).length &&
    crypto.timingSafeEqual(Buffer.from(legacyHash), Buffer.from(user.passwordHash));

  if (isLegacyMatch) {
    user.salt = crypto.randomBytes(32).toString("hex");
    user.passwordHash = hashPasswordStrong(password, user.salt);
    saveDatabase();
    return true;
  }

  return false;
}

function hashPassword(password: string, salt: string = "blogge_salt_2026"): string {
  return hashPasswordStrong(password, salt);
}

export function createSessionToken(user: any): string {
  const assignedRole = isEmailAdmin(user.email) ? 'admin' : (user.role === 'admin' ? 'reader' : (user.role || 'reader'));
  const payload = Buffer.from(JSON.stringify({
    userId: user.id,
    role: assignedRole,
    email: user.email.toLowerCase(),
    tokenVersion: user.tokenVersion || 0,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000
  })).toString("base64url");
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string): { userId: string; role: string; email: string; tokenVersion?: number } | null {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [payloadStr, signature] = parts;
    const expectedSig = crypto.createHmac("sha256", SESSION_SECRET).update(payloadStr).digest("base64url");
    
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(payloadStr, "base64url").toString("utf8"));
    if (payload.exp && payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

async function getAuthenticatedUser(req: Request): Promise<{ id: string; role: string; email?: string } | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7).trim();
  if (!token) return null;

  const db = getDb();

  // 1. Session token verification
  const session = verifySessionToken(token);
  if (session && session.userId) {
    let user = db.users.find((u: any) => u.id === session.userId);
    if (!user && session.email) {
      user = db.users.find((u: any) => u.email && u.email.toLowerCase() === session.email.toLowerCase());
    }
    
    if (user && user.status !== 'banned') {
      // Invalidate if tokenVersion mismatch (e.g. password was reset)
      if (typeof session.tokenVersion === 'number' && typeof user.tokenVersion === 'number') {
        if (session.tokenVersion !== user.tokenVersion) {
          return null;
        }
      }

      const isAdmin = isEmailAdmin(user.email);
      const effectiveRole = isAdmin ? 'admin' : (user.role === 'admin' ? 'reader' : (user.role || 'reader'));
      return { id: user.id, role: effectiveRole, email: user.email };
    }
    return null;
  }

  // 2. JWT / Firebase ID token verification with cryptographic RS256 signature check
  const parts = token.split('.');
  if (parts.length === 3) {
    const verified = await verifyGoogleOrFirebaseIdToken(token);
    if (verified && verified.email) {
      const normEmail = verified.email.toLowerCase();
      let user = db.users.find((u: any) => u.email && u.email.toLowerCase() === normEmail);
      
      if (!user) {
        const assignedRole = isEmailAdmin(normEmail) ? 'admin' : 'reader';
        const salt = crypto.randomBytes(32).toString("hex");
        const passwordHash = hashPassword(crypto.randomBytes(32).toString("hex"), salt);
        const safeAvatar = verified.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(verified.name || normEmail)}`;

        user = {
          id: 'usr_' + Date.now(),
          name: (verified.name || normEmail.split('@')[0]).trim(),
          email: normEmail,
          avatar: safeAvatar,
          avatarUrl: safeAvatar,
          profileImageUrl: safeAvatar,
          bio: 'Blogger platform member authenticated via Google.',
          role: assignedRole,
          status: 'active',
          twoFactorEnabled: false,
          authProvider: 'google',
          tokenVersion: 0,
          salt,
          passwordHash,
          joinedAt: new Date().toISOString().split('T')[0]
        };
        db.users.push(user);
        saveDatabase();
      }

      if (user.status !== 'banned') {
        const isAdmin = isEmailAdmin(user.email);
        const effectiveRole = isAdmin ? 'admin' : (user.role === 'admin' ? 'reader' : (user.role || 'reader'));
        return { id: user.id, role: effectiveRole, email: user.email };
      }
    }
  }

  return null;
}

// Active session & device tracking map for real-time analytics
const activeSessions: Map<string, number> = new Map();
const SESSION_TIMEOUT_MS = 2 * 60 * 1000;
const knownSessionIds: Set<string> = new Set();
const viewedPostsKeys: Set<string> = new Set();

function syncAnalyticsCacheFromDb() {
  const db = getDb();
  if (!db.analytics) {
    db.analytics = {
      liveVisitors: 0,
      totalViews: (db.posts || []).reduce((acc: number, p: any) => acc + (Number(p.views) || 0), 0),
      totalVisitors: 0,
      avgReadingTime: "3.5 mins",
      bounceRate: "42%",
      deviceStats: { mobile: 0, desktop: 0, tablet: 0 },
      countries: [],
      trafficHistory: [],
      sessions: [],
      postViews: []
    };
  }
  if (!Array.isArray(db.analytics.sessions)) db.analytics.sessions = [];
  if (!Array.isArray(db.analytics.postViews)) db.analytics.postViews = [];

  for (const s of db.analytics.sessions) {
    if (s && s.sessionId) knownSessionIds.add(s.sessionId);
  }
  for (const pv of db.analytics.postViews) {
    if (pv && pv.key) viewedPostsKeys.add(pv.key);
  }
}

function trackSession(sessionId: string, deviceType: 'mobile' | 'desktop' | 'tablet' = 'desktop') {
  if (!sessionId) return;
  const now = Date.now();
  activeSessions.set(sessionId, now);

  const db = getDb();
  if (!db.analytics) syncAnalyticsCacheFromDb();

  if (!knownSessionIds.has(sessionId)) {
    knownSessionIds.add(sessionId);
    db.analytics.totalVisitors = (Number(db.analytics.totalVisitors) || 0) + 1;

    if (!db.analytics.deviceStats) {
      db.analytics.deviceStats = { mobile: 0, desktop: 0, tablet: 0 };
    }
    db.analytics.deviceStats[deviceType] = (Number(db.analytics.deviceStats[deviceType]) || 0) + 1;

    db.analytics.sessions.push({
      sessionId,
      deviceType,
      firstSeen: new Date().toISOString()
    });

    if (db.analytics.sessions.length > 5000) {
      db.analytics.sessions = db.analytics.sessions.slice(-2500);
    }
    saveDatabase();
  }
}

function recordPostView(postId: string, sessionId: string): { views: number; totalViews: number } {
  const db = getDb();
  if (!db.analytics) syncAnalyticsCacheFromDb();

  const post = (db.posts || []).find((p: any) => p.id === postId);
  if (!post) {
    const totalViews = (db.posts || []).reduce((acc: number, p: any) => acc + (Number(p.views) || 0), 0);
    return { views: 0, totalViews };
  }

  const viewKey = `${sessionId || 'anon'}:${postId}`;
  const isDuplicateInSession = sessionId ? viewedPostsKeys.has(viewKey) : false;

  if (!isDuplicateInSession) {
    if (sessionId) {
      viewedPostsKeys.add(viewKey);
      db.analytics.postViews.push({
        key: viewKey,
        postId,
        sessionId,
        timestamp: new Date().toISOString()
      });
      if (db.analytics.postViews.length > 10000) {
        db.analytics.postViews = db.analytics.postViews.slice(-5000);
      }
    }

    post.views = (Number(post.views) || 0) + 1;
    db.analytics.totalViews = (db.posts || []).reduce((acc: number, p: any) => acc + (Number(p.views) || 0), 0);
    saveDatabase();
  }

  return {
    views: post.views,
    totalViews: db.analytics.totalViews || post.views
  };
}

function getLiveVisitorsCount(): number {
  const now = Date.now();
  let count = 0;
  for (const [id, lastSeen] of activeSessions.entries()) {
    if (now - lastSeen <= SESSION_TIMEOUT_MS) {
      count++;
    } else {
      activeSessions.delete(id);
    }
  }
  return Math.max(1, count);
}

// Initial DB sanity & admin check
{
  const initialDb = initDatabase();
  syncAnalyticsCacheFromDb();

  let needsSave = false;
  const adminEmail = getAdminEmail();
  initialDb.users.forEach((user: any) => {
    if (!user.salt || !user.passwordHash) {
      user.salt = crypto.randomBytes(32).toString("hex");
      user.passwordHash = hashPasswordStrong(crypto.randomBytes(32).toString("hex"), user.salt);
      needsSave = true;
    }
    if (typeof user.tokenVersion !== 'number') {
      user.tokenVersion = 0;
      needsSave = true;
    }
    if (adminEmail) {
      if (user.email && user.email.toLowerCase() === adminEmail) {
        if (user.role !== 'admin') {
          user.role = 'admin';
          needsSave = true;
        }
      } else if (user.role === 'admin') {
        user.role = 'reader';
        needsSave = true;
      }
    }
  });
  if (needsSave) {
    saveDatabase();
  }
}

// Initialize Google GenAI client (Server-Side only)
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

// Transactional Email Dispatcher for Password Resets
async function sendPasswordResetEmail(recipientEmail: string, resetToken: string): Promise<boolean> {
  const resetUrl = `${APP_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;
  
  if (!RESEND_API_KEY) {
    console.log(`[Email Notice] RESEND_API_KEY not configured. Password reset link for ${recipientEmail}: ${resetUrl}`);
    return false;
  }

  try {
    const htmlBody = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #0f172a; margin-bottom: 16px;">পাসওয়ার্ড রিসেট অনুরোধ | Blogge Security</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
          আপনার Blogge অ্যাকাউন্টের জন্য একটি পাসওয়ার্ড রিসেট অনুরোধ পাওয়া গেছে। পাসওয়ার্ড পরিবর্তন করতে নিচের বাটনে ক্লিক করুন:
        </p>
        <div style="margin: 28px 0; text-align: center;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">পাসওয়ার্ড রিসেট করুন</a>
        </div>
        <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
          এই লিংকটি ১ ঘণ্টার জন্য কার্যকর থাকবে। আপনি যদি পাসওয়ার্ড রিসেট করার অনুরোধ না করে থাকেন, তবে এই ইমেইলটি উপেক্ষা করুন।
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">© 2026 Blogge Publishing Platform. All rights reserved.</p>
      </div>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [recipientEmail],
        subject: "পাসওয়ার্ড রিসেট লিংক | Blogge Password Reset",
        html: htmlBody
      })
    });

    if (response.ok) {
      console.log(`[Email] Password reset email successfully dispatched to ${recipientEmail}`);
      return true;
    } else {
      const errText = await response.text();
      console.warn(`[Email] Resend API rejected message to ${recipientEmail}:`, errText);
      return false;
    }
  } catch (err) {
    console.error(`[Email] Error sending reset email to ${recipientEmail}:`, err);
    return false;
  }
}

export async function createApp(options: { skipVite?: boolean } = {}) {
  const app = express();
  const PORT = 3000;

  // Security Headers Middleware
  app.use((_req: Request, res: Response, next: express.NextFunction) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    
    if (isProduction) {
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }

    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.firebaseapp.com https://*.googleapis.com https://cdn.jsdelivr.net; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com data:; " +
      "img-src 'self' data: https: blob:; " +
      "connect-src 'self' https: ws: wss:; " +
      "frame-src 'self' https://* http://localhost:* https://accounts.google.com;"
    );
    next();
  });

  // Production-Safe CORS Middleware
  app.use((req: Request, res: Response, next: express.NextFunction) => {
    const origin = req.headers.origin;

    if (origin) {
      if (isOriginAllowed(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
      } else if (isProduction) {
        // In production, reject unauthorized origins
        if (req.method === "OPTIONS") {
          return res.status(403).json({ error: "CORS origin not allowed" });
        }
      }
    } else if (!isProduction) {
      // In dev mode when no origin header (same-origin / cURL), allow local dev
      res.setHeader("Access-Control-Allow-Origin", "*");
    }

    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, X-Admin-Key, X-Blogge-API, X-Session-Id");
    
    if (req.path && req.path.startsWith('/api')) {
      res.setHeader('X-Blogge-API', 'profile-upload-v3');
    }

    if (req.method === "OPTIONS") {
      if (origin && isProduction && !isOriginAllowed(origin)) {
        return res.status(403).json({ error: "CORS origin not allowed" });
      }
      return res.status(204).end();
    }
    next();
  });

  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ extended: true, limit: "5mb" }));

  // Authentication Middlewares
  const requireAuth = async (req: Request, res: Response, next: express.NextFunction) => {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return res.status(401).json({ error: "Authentication required." });
    }
    const db = getDb();
    const user = db.users.find((u: any) => u.id === authUser.id);
    if (user && user.status === 'banned') {
      return res.status(403).json({ error: "Account has been suspended." });
    }
    (req as any).user = authUser;
    return next();
  };

  const requireAuthorOrAdmin = async (req: Request, res: Response, next: express.NextFunction) => {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return res.status(401).json({ error: "Authentication required to publish or manage content." });
    }
    const db = getDb();
    const user = db.users.find((u: any) => u.id === authUser.id);
    if (user && user.status === 'banned') {
      return res.status(403).json({ error: "Account has been suspended." });
    }
    if (!['admin', 'editor', 'author'].includes(authUser.role)) {
      return res.status(403).json({ error: "Author or higher privileges required." });
    }
    (req as any).user = authUser;
    return next();
  };

  const requireEditorOrAdmin = async (req: Request, res: Response, next: express.NextFunction) => {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return res.status(401).json({ error: "Authentication required." });
    }
    const db = getDb();
    const user = db.users.find((u: any) => u.id === authUser.id);
    if (user && user.status === 'banned') {
      return res.status(403).json({ error: "Account has been suspended." });
    }
    if (!['admin', 'editor'].includes(authUser.role)) {
      return res.status(403).json({ error: "Editor or higher privileges required." });
    }
    (req as any).user = authUser;
    return next();
  };

  const requireAdminAuth = async (req: Request, res: Response, next: express.NextFunction) => {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return res.status(401).json({ error: "Authentication required." });
    }
    if (!isEmailAdmin(authUser.email) || authUser.role !== 'admin') {
      return res.status(403).json({ 
        error: "Forbidden: Administrator privileges are strictly restricted to the configured ADMIN_EMAIL account." 
      });
    }
    const db = getDb();
    const user = db.users.find((u: any) => u.id === authUser.id);
    if (user && user.status === 'banned') {
      return res.status(403).json({ error: "Account has been suspended." });
    }
    (req as any).user = authUser;
    return next();
  };

  // Static uploads directory serving
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  const avatarsDir = path.join(uploadsDir, "avatars");
  if (!fs.existsSync(avatarsDir)) {
    fs.mkdirSync(avatarsDir, { recursive: true });
  }
  app.use("/uploads", express.static(uploadsDir));
  app.use("/avatars", express.static(path.join(process.cwd(), "public", "avatars")));

  // Dedicated server-to-server maintenance endpoint
  app.get("/api/system/maintenance/status", (req: Request, res: Response) => {
    const adminKey = req.headers['x-admin-key'];
    if (adminKey && ADMIN_API_KEY && adminKey === ADMIN_API_KEY) {
      return res.json({ status: "ok", maintenance: true, timestamp: new Date().toISOString() });
    }
    return res.status(403).json({ error: "Forbidden: Invalid maintenance key." });
  });

  // Health check endpoint
  app.get("/api/health", (_req: Request, res: Response) => {
    res.status(200).json({ 
      success: true,
      service: "blogge-api",
      version: "profile-upload-v3",
      uploadRoute: true,
      timestamp: new Date().toISOString()
    });
  });

  // Runtime Origin Diagnostics endpoint
  app.get("/api/runtime", (req: Request, res: Response) => {
    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host || `localhost:${PORT}`;
    const safeOrigin = `${proto}://${host}`;

    res.status(200).json({
      success: true,
      service: "blogge-api",
      apiOrigin: safeOrigin,
      host: String(host),
      port: PORT,
      protocol: String(proto),
      uploadRoute: true,
      runtimeVersion: "profile-upload-v3"
    });
  });

  // Safe Configuration Diagnostic Endpoint (NEVER exposes secret values)
  app.get("/api/config/status", (_req: Request, res: Response) => {
    const cloudinaryStatus = getCloudinaryStatus();
    const hasFirebase = Boolean(
      process.env.FIREBASE_CONFIG || 
      process.env.FIREBASE_PROJECT_ID || 
      process.env.VITE_FIREBASE_PROJECT_ID ||
      fs.existsSync(path.join(process.cwd(), 'firebase-applet-config.json'))
    );
    const hasAdmin = Boolean(getAdminEmail());
    const hasSession = Boolean(SESSION_SECRET);

    res.json({
      cloudinary: {
        configured: cloudinaryStatus.configured,
        mode: cloudinaryStatus.mode
      },
      firebase: {
        configured: hasFirebase,
        projectIdConfigured: Boolean(FIREBASE_PROJECT_ID)
      },
      admin: {
        configured: hasAdmin,
        adminEmail: getAdminEmail()
      },
      security: {
        sessionConfigured: hasSession,
        productionMode: isProduction,
        resendConfigured: Boolean(RESEND_API_KEY)
      }
    });
  });

  // Public Bootstrap data endpoint
  app.get("/api/bootstrap", (_req: Request, res: Response) => {
    const db = getDb();
    const publicPosts = (db.posts || []).filter((p: any) => p.status === 'published');
    const publicPages = (db.pages || []).filter((p: any) => p.status === 'published');
    const enabledWidgets = (db.widgets || []).filter((w: any) => w.isEnabled !== false && w.enabled !== false);
    
    res.json({
      success: true,
      data: {
        posts: publicPosts,
        pages: publicPages,
        widgets: enabledWidgets,
        settings: db.settings,
        themes: db.themes,
        analytics: {
          liveVisitors: getLiveVisitorsCount(),
          totalViews: db.analytics?.totalViews || 0,
          totalVisitors: db.analytics?.totalVisitors || 0
        }
      }
    });
  });

  // Full Admin DB sync endpoint
  app.get("/api/admin/db", requireAdminAuth, (_req: Request, res: Response) => {
    const db = getDb();
    const sanitizedUsers = (db.users || []).map((u: any) => {
      const { passwordHash: _, salt: __, resetTokenHash: ___, ...safe } = u;
      return safe;
    });

    res.json({
      success: true,
      data: {
        ...db,
        users: sanitizedUsers,
        analytics: {
          ...db.analytics,
          liveVisitors: getLiveVisitorsCount()
        }
      }
    });
  });

  // ==========================================
  // ANALYTICS & STATS REST API
  // ==========================================
  app.get("/api/stats", (_req: Request, res: Response) => {
    const db = getDb();
    if (!db.analytics) syncAnalyticsCacheFromDb();

    const liveCount = getLiveVisitorsCount();
    const calculatedTotalViews = (db.posts || []).reduce((acc: number, p: any) => acc + (Number(p.views) || 0), 0);

    res.json({
      success: true,
      liveVisitors: liveCount,
      totalViews: db.analytics.totalViews || calculatedTotalViews,
      totalVisitors: db.analytics.totalVisitors || 1,
      avgReadingTime: db.analytics.avgReadingTime || "3.5 mins",
      bounceRate: db.analytics.bounceRate || "42%",
      deviceStats: db.analytics.deviceStats || { mobile: 1, desktop: 2, tablet: 0 },
      countries: db.analytics.countries || [
        { name: "বাংলাদেশ (Bangladesh)", views: 18450, percentage: 65 },
        { name: "ভারত (India)", views: 5600, percentage: 20 },
        { name: "যুক্তরাষ্ট্র (USA)", views: 2800, percentage: 10 },
        { name: "অন্যান্য (Others)", views: 1400, percentage: 5 }
      ],
      trafficHistory: db.analytics.trafficHistory || [
        { date: "Mon", views: 240, visitors: 180 },
        { date: "Tue", views: 320, visitors: 220 },
        { date: "Wed", views: 450, visitors: 310 },
        { date: "Thu", views: 510, visitors: 390 },
        { date: "Fri", views: 620, visitors: 480 },
        { date: "Sat", views: 780, visitors: 590 },
        { date: "Sun", views: 890, visitors: 670 }
      ]
    });
  });

  app.post("/api/analytics/event", (req: Request, res: Response) => {
    const { eventType, sessionId, deviceType = 'desktop' } = req.body;
    if (sessionId) {
      trackSession(sessionId, deviceType);
    }
    res.json({ success: true, eventType });
  });

  // ==========================================
  // POSTS REST API
  // ==========================================
  app.get("/api/posts", (req: Request, res: Response) => {
    const db = getDb();
    const { status, category, tag, search, authorId } = req.query;
    let list = [...(db.posts || [])];

    if (status) {
      list = list.filter((p: any) => p.status === status);
    }
    if (category) {
      list = list.filter((p: any) => p.categories && p.categories.includes(String(category)));
    }
    if (tag) {
      list = list.filter((p: any) => p.tags && p.tags.includes(String(tag)));
    }
    if (authorId) {
      list = list.filter((p: any) => p.author && p.author.id === String(authorId));
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter((p: any) => 
        (p.title && p.title.toLowerCase().includes(q)) || 
        (p.summary && p.summary.toLowerCase().includes(q)) ||
        (p.content && p.content.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, posts: list });
  });

  app.get("/api/posts/:id", (req: Request, res: Response) => {
    const db = getDb();
    const post = (db.posts || []).find((p: any) => p.id === req.params.id || p.slug === req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json({ success: true, post });
  });

  app.post("/api/posts", requireAuthorOrAdmin, (req: Request, res: Response) => {
    const db = getDb();
    const body = req.body;
    const authUser = (req as any).user;
    const authorUser = db.users.find((u: any) => u.id === authUser.id);

    if (!body.title || !body.content) {
      return res.status(400).json({ error: "Post title and content are required." });
    }

    // Authoritative Server-Side HTML Sanitization
    const sanitizedTitle = sanitizeHtml(body.title.trim());
    const sanitizedContent = sanitizeHtml(body.content);
    const sanitizedSummary = sanitizeHtml(body.summary || body.title);
    const sanitizedCaption = sanitizeHtml(body.imageCaption || '');

    const newPost = {
      id: body.id || 'post_' + Date.now(),
      title: sanitizedTitle,
      slug: body.slug || sanitizedTitle.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-') + '-' + Date.now(),
      summary: sanitizedSummary,
      content: sanitizedContent,
      featuredImage: body.featuredImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      imageCaption: sanitizedCaption,
      author: {
        id: authorUser?.id || authUser?.id,
        name: authorUser?.name || 'Author',
        avatar: authorUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      },
      categories: Array.isArray(body.categories) ? body.categories : ['সাধারণ'],
      tags: Array.isArray(body.tags) ? body.tags : ['Blogging'],
      status: body.status || 'published',
      publishedAt: body.publishedAt || new Date().toISOString(),
      scheduledAt: body.scheduledAt || null,
      updatedAt: new Date().toISOString(),
      views: 0,
      likes: 0,
      isLikedByUser: false,
      isPaywalled: body.isPaywalled || false,
      readingTimeMinutes: body.readingTimeMinutes || 3,
      seo: body.seo || {
        metaTitle: `${sanitizedTitle} | Blogge`,
        metaDescription: sanitizedSummary,
        keywords: body.tags || []
      },
      affiliateLinks: Array.isArray(body.affiliateLinks) ? body.affiliateLinks : []
    };

    db.posts.unshift(newPost);
    logActivity(newPost.author.id, newPost.author.name, 'POST_CREATE', 'নতুন পোস্ট তৈরি', newPost.title);
    saveDatabase();
    res.status(201).json({ success: true, post: newPost });
  });

  app.put("/api/posts/:id", requireAuthorOrAdmin, (req: Request, res: Response) => {
    const db = getDb();
    const index = db.posts.findIndex((p: any) => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: "Post not found" });
    }
    const authUser = (req as any).user;
    const post = db.posts[index];
    const isAuthor = post.author && post.author.id === authUser.id;
    const isAdminOrEditor = authUser.role === 'admin' || authUser.role === 'editor';
    if (!isAuthor && !isAdminOrEditor) {
      return res.status(403).json({ error: "Forbidden: You do not have permission to edit this post." });
    }

    const updates = { ...req.body };
    if (updates.title) updates.title = sanitizeHtml(updates.title);
    if (updates.content) updates.content = sanitizeHtml(updates.content);
    if (updates.summary) updates.summary = sanitizeHtml(updates.summary);
    if (updates.imageCaption) updates.imageCaption = sanitizeHtml(updates.imageCaption);

    db.posts[index] = {
      ...db.posts[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    logActivity(authUser.id, authUser.email || 'Author', 'POST_UPDATE', 'পোস্ট হালনাগাদ', db.posts[index].title);
    saveDatabase();
    res.json({ success: true, post: db.posts[index] });
  });

  app.delete("/api/posts/:id", requireAuthorOrAdmin, (req: Request, res: Response) => {
    const db = getDb();
    const index = db.posts.findIndex((p: any) => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: "Post not found" });
    }
    const authUser = (req as any).user;
    const post = db.posts[index];
    const isAuthor = post.author && post.author.id === authUser.id;
    const isAdmin = authUser.role === 'admin';
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ error: "Forbidden: You do not have permission to delete this post." });
    }

    const removed = db.posts.splice(index, 1)[0];
    logActivity(authUser.id, authUser.email || 'Admin', 'POST_DELETE', 'পোস্ট মুছে ফেলা', removed.title);
    saveDatabase();
    res.json({ success: true, deleted: removed });
  });

  // Authoritative user-scoped like endpoint
  app.post("/api/posts/:id/like", async (req: Request, res: Response) => {
    const db = getDb();
    const postId = req.params.id;
    const authUser = await getAuthenticatedUser(req);

    const post = (db.posts || []).find((p: any) => p.id === postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const userId = authUser ? authUser.id : (typeof req.body.userId === 'string' && req.body.userId.startsWith('client_') ? req.body.userId : 'guest_' + (req.ip || 'anon'));

    db.likes = db.likes || [];
    const userLikeIdx = db.likes.findIndex((l: any) => l.postId === postId && l.userId === userId);

    let isLiked = false;
    if (userLikeIdx !== -1) {
      db.likes.splice(userLikeIdx, 1);
      post.likes = Math.max(0, (post.likes || 0) - 1);
      isLiked = false;
    } else {
      db.likes.push({
        id: 'like_' + Date.now(),
        postId,
        userId,
        likedAt: new Date().toISOString()
      });
      post.likes = (post.likes || 0) + 1;
      isLiked = true;
    }

    saveDatabase();
    res.json({ success: true, likes: post.likes, isLiked, isLikedByUser: isLiked });
  });

  app.post("/api/posts/:id/view", (req: Request, res: Response) => {
    const sessionId = (req.body?.sessionId as string) || (req.query?.sessionId as string) || (req.headers['x-session-id'] as string) || '';
    if (sessionId) trackSession(sessionId);
    const result = recordPostView(req.params.id, sessionId);
    res.json({ success: true, ...result });
  });

  // ==========================================
  // COMMENTS REST API
  // ==========================================
  app.get("/api/comments", (req: Request, res: Response) => {
    const db = getDb();
    const { postId, status } = req.query;
    let list = [...(db.comments || [])];
    if (postId) list = list.filter((c: any) => c.postId === postId);
    if (status) list = list.filter((c: any) => c.status === status);
    res.json({ success: true, comments: list });
  });

  app.post("/api/comments", (req: Request, res: Response) => {
    const clientIp = req.ip || '127.0.0.1';
    if (!checkRateLimit(`comment_${clientIp}`, 20, 10 * 60 * 1000)) {
      return res.status(429).json({ error: "Too many comments submitted. Please try again later." });
    }

    const db = getDb();
    const { postId, authorName, authorEmail, authorAvatar, content, parentId } = req.body;
    if (!postId || !content || typeof content !== 'string') {
      return res.status(400).json({ error: "Post ID and content are required." });
    }

    const cleanContent = sanitizeHtml(content.trim());
    const cleanAuthorName = sanitizeHtml(authorName || 'Anonymous Reader');

    const isSpam = (db.settings?.spamFilterKeywords || []).some((kw: string) => 
      cleanContent.toLowerCase().includes(kw.toLowerCase())
    );

    const newComment = {
      id: 'cmt_' + Date.now(),
      postId,
      authorName: cleanAuthorName,
      authorEmail: authorEmail || 'reader@example.com',
      authorAvatar: authorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanAuthorName}`,
      content: cleanContent,
      createdAt: new Date().toISOString(),
      status: isSpam ? 'spam' : (db.settings?.moderateComments ? 'pending' : 'approved'),
      likes: 0,
      reportsCount: 0,
      parentId: parentId || null,
      replies: []
    };

    if (parentId) {
      const parent = (db.comments || []).find((c: any) => c.id === parentId);
      if (parent) {
        parent.replies = parent.replies || [];
        parent.replies.push(newComment);
      } else {
        db.comments.unshift(newComment);
      }
    } else {
      db.comments.unshift(newComment);
    }

    logActivity('reader', newComment.authorName, 'COMMENT_ADD', 'নতুন মন্তব্য', `Post ${postId}: ${cleanContent.substring(0, 40)}`);
    saveDatabase();
    res.status(201).json({ success: true, comment: newComment, isSpam });
  });

  app.put("/api/comments/:id/status", requireEditorOrAdmin, (req: Request, res: Response) => {
    const db = getDb();
    const { status } = req.body;
    let found = false;

    function updateStatus(list: any[]) {
      for (const c of list) {
        if (c.id === req.params.id) {
          c.status = status;
          found = true;
          return;
        }
        if (c.replies && c.replies.length > 0) {
          updateStatus(c.replies);
        }
      }
    }

    updateStatus(db.comments || []);
    if (!found) return res.status(404).json({ error: "Comment not found" });

    saveDatabase();
    res.json({ success: true, id: req.params.id, status });
  });

  app.post("/api/comments/:id/reply", requireEditorOrAdmin, (req: Request, res: Response) => {
    const db = getDb();
    const { authorName, content } = req.body;
    const parentComment = (db.comments || []).find((c: any) => c.id === req.params.id);
    if (!parentComment) return res.status(404).json({ error: "Parent comment not found" });

    const cleanReplyContent = sanitizeHtml(content || '');

    const reply = {
      id: 'cmt_reply_' + Date.now(),
      postId: parentComment.postId,
      authorName: authorName || 'সাপোর্ট টিম',
      authorEmail: 'support@blogge.io',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      content: cleanReplyContent,
      createdAt: new Date().toISOString(),
      status: 'approved',
      likes: 0,
      parentId: parentComment.id
    };

    parentComment.replies = parentComment.replies || [];
    parentComment.replies.push(reply);
    saveDatabase();
    res.status(201).json({ success: true, reply });
  });

  app.delete("/api/comments/:id", requireAuth, (req: Request, res: Response) => {
    const db = getDb();
    const authUser = (req as any).user;
    const isAdminOrEditor = authUser.role === 'admin' || authUser.role === 'editor';

    const comment = (db.comments || []).find((c: any) => c.id === req.params.id);
    if (comment && !isAdminOrEditor && comment.authorEmail !== authUser.email && comment.authorId !== authUser.id) {
      return res.status(403).json({ error: "Forbidden: You cannot delete another user's comment." });
    }

    db.comments = (db.comments || []).filter((c: any) => c.id !== req.params.id);
    db.comments.forEach((c: any) => {
      if (c.replies) {
        c.replies = c.replies.filter((r: any) => r.id !== req.params.id);
      }
    });

    saveDatabase();
    res.json({ success: true, deleted: true });
  });

  // ==========================================
  // PAGES REST API
  // ==========================================
  app.get("/api/pages", (req: Request, res: Response) => {
    const db = getDb();
    res.json({ success: true, pages: db.pages || [] });
  });

  app.post("/api/pages", requireAdminAuth, (req: Request, res: Response) => {
    const db = getDb();
    const body = req.body;
    const title = sanitizeHtml(body.title || 'Untitled Page');
    const content = sanitizeHtml(body.content || '');

    const newPage = {
      id: body.id || 'page_' + Date.now(),
      title,
      slug: body.slug || title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-'),
      content,
      status: body.status || 'published',
      isDefault: false,
      updatedAt: new Date().toISOString().split('T')[0],
      seo: body.seo || {
        metaTitle: `${title} | Blogge`,
        metaDescription: title
      }
    };
    db.pages.push(newPage);
    saveDatabase();
    res.status(201).json({ success: true, page: newPage });
  });

  app.put("/api/pages/:id", requireAdminAuth, (req: Request, res: Response) => {
    const db = getDb();
    const idx = (db.pages || []).findIndex((p: any) => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Page not found" });

    const updates = { ...req.body };
    if (updates.title) updates.title = sanitizeHtml(updates.title);
    if (updates.content) updates.content = sanitizeHtml(updates.content);

    db.pages[idx] = { ...db.pages[idx], ...updates, updatedAt: new Date().toISOString().split('T')[0] };
    saveDatabase();
    res.json({ success: true, page: db.pages[idx] });
  });

  app.delete("/api/pages/:id", requireAdminAuth, (req: Request, res: Response) => {
    const db = getDb();
    db.pages = (db.pages || []).filter((p: any) => p.id !== req.params.id);
    saveDatabase();
    res.json({ success: true });
  });

  // ==========================================
  // LAYOUT WIDGETS REST API
  // ==========================================
  app.get("/api/widgets", (req: Request, res: Response) => {
    const db = getDb();
    res.json({ success: true, widgets: db.widgets || [] });
  });

  app.post("/api/widgets", requireAdminAuth, (req: Request, res: Response) => {
    const db = getDb();
    const newWidget = {
      id: 'widget_' + Date.now(),
      title: req.body.title || 'New Gadget',
      type: req.body.type || 'custom_html',
      section: req.body.section || 'sidebar',
      location: req.body.location || 'sidebar',
      order: (db.widgets || []).length + 1,
      isEnabled: true,
      enabled: true,
      settings: req.body.settings || {}
    };
    db.widgets.push(newWidget);
    saveDatabase();
    res.status(201).json({ success: true, widget: newWidget });
  });

  app.put("/api/widgets/:id", requireAdminAuth, (req: Request, res: Response) => {
    const db = getDb();
    const idx = (db.widgets || []).findIndex((w: any) => w.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Widget not found" });
    db.widgets[idx] = { ...db.widgets[idx], ...req.body };
    saveDatabase();
    res.json({ success: true, widget: db.widgets[idx] });
  });

  app.post("/api/widgets/reorder", requireAdminAuth, (req: Request, res: Response) => {
    const db = getDb();
    const { widgets } = req.body;
    if (Array.isArray(widgets)) {
      db.widgets = widgets;
      saveDatabase();
    }
    res.json({ success: true, widgets: db.widgets });
  });

  app.delete("/api/widgets/:id", requireAdminAuth, (req: Request, res: Response) => {
    const db = getDb();
    db.widgets = (db.widgets || []).filter((w: any) => w.id !== req.params.id);
    saveDatabase();
    res.json({ success: true });
  });

  // ==========================================
  // SETTINGS & THEMES REST API
  // ==========================================
  app.get("/api/settings", (req: Request, res: Response) => {
    const db = getDb();
    res.json({ success: true, settings: db.settings });
  });

  app.post("/api/settings", requireAdminAuth, (req: Request, res: Response) => {
    const db = getDb();
    const updates = { ...req.body };
    if (updates.customCss) {
      updates.customCss = sanitizeCss(updates.customCss);
    }
    db.settings = { ...db.settings, ...updates };
    logActivity('usr_admin', 'Admin', 'SETTINGS_UPDATE', 'সাইট সেটিংস আপডেট', 'Site configuration modified');
    saveDatabase();
    res.json({ success: true, settings: db.settings });
  });

  app.get("/api/themes", (req: Request, res: Response) => {
    const db = getDb();
    res.json({ success: true, themes: db.themes || [] });
  });

  app.post("/api/themes", requireAdminAuth, (req: Request, res: Response) => {
    const db = getDb();
    const newTheme = {
      id: 'theme_' + Date.now(),
      isCustom: true,
      ...req.body
    };
    db.themes.push(newTheme);
    saveDatabase();
    res.status(201).json({ success: true, theme: newTheme });
  });

  // ==========================================
  // MEDIA LIBRARY REST API
  // ==========================================
  app.get("/api/media", (req: Request, res: Response) => {
    const db = getDb();
    res.json({ success: true, media: db.media || [] });
  });

  app.post("/api/media", requireAuthorOrAdmin, (req: Request, res: Response) => {
    const db = getDb();
    const { name, url, type, sizeBytes, mimeType, altText } = req.body;
    if (!url) return res.status(400).json({ error: "Media URL is required" });

    const newMedia = {
      id: 'med_' + Date.now(),
      name: name || 'Uploaded file',
      fileName: name || 'file.jpg',
      url,
      type: type || 'image',
      sizeBytes: sizeBytes || 245000,
      mimeType: mimeType || 'image/jpeg',
      uploadedAt: new Date().toISOString(),
      altText: altText || ''
    };

    db.media.unshift(newMedia);
    saveDatabase();
    res.status(201).json({ success: true, media: newMedia });
  });

  app.delete("/api/media/:id", requireAuthorOrAdmin, (req: Request, res: Response) => {
    const db = getDb();
    db.media = (db.media || []).filter((m: any) => m.id !== req.params.id);
    saveDatabase();
    res.json({ success: true });
  });

  // ==========================================
  // SUBSCRIBERS & NEWSLETTER REST API
  // ==========================================
  app.get("/api/subscribers", requireAdminAuth, (req: Request, res: Response) => {
    const db = getDb();
    res.json({ success: true, subscribers: db.subscribers || [], count: (db.subscribers || []).length });
  });

  app.post("/api/subscribers", (req: Request, res: Response) => {
    const db = getDb();
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: "Valid email address required" });
    }

    const normEmail = email.trim().toLowerCase();
    if ((db.subscribers || []).some((s: any) => s.email.toLowerCase() === normEmail)) {
      return res.json({ success: true, message: "Already subscribed", subscriber: { email: normEmail } });
    }

    const newSub = {
      id: 'sub_' + Date.now(),
      email: normEmail,
      subscribedAt: new Date().toISOString().split('T')[0],
      isActive: true
    };
    db.subscribers = db.subscribers || [];
    db.subscribers.unshift(newSub);
    saveDatabase();
    res.status(201).json({ success: true, subscriber: newSub });
  });

  // ==========================================
  // LIVE SUPPORT CHAT REST API
  // ==========================================
  app.get("/api/support/chat", (_req: Request, res: Response) => {
    const db = getDb();
    res.json({ success: true, messages: db.chatMessages || [] });
  });

  app.post("/api/support/chat", (req: Request, res: Response) => {
    const db = getDb();
    const { sender, senderName, text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: "Message text is required" });
    }

    const cleanText = sanitizeHtml(text.trim());

    const newMsg = {
      id: 'msg_' + Date.now(),
      sender: sender || 'user',
      senderName: senderName || 'User',
      text: cleanText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    db.chatMessages = db.chatMessages || [];
    db.chatMessages.push(newMsg);
    if (db.chatMessages.length > 500) db.chatMessages = db.chatMessages.slice(-250);
    saveDatabase();
    res.status(201).json({ success: true, message: newMsg });
  });

  // ==========================================
  // DONATIONS & MONETIZATION REST API
  // ==========================================
  app.get("/api/donations", (_req: Request, res: Response) => {
    const db = getDb();
    res.json({ success: true, donations: db.donations || [] });
  });

  app.post("/api/donations", (req: Request, res: Response) => {
    const db = getDb();
    const { donorName, donorEmail, amount, currency, message, method } = req.body;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: "Valid amount required" });
    }

    const newDonation = {
      id: 'don_' + Date.now(),
      donorName: donorName || 'Anonymous Supporter',
      donorEmail: donorEmail || '',
      amount: Number(amount),
      currency: currency || 'BDT',
      message: message ? sanitizeHtml(message) : '',
      method: method || 'bKash',
      status: 'completed',
      createdAt: new Date().toISOString()
    };

    db.donations = db.donations || [];
    db.donations.unshift(newDonation);
    saveDatabase();
    res.status(201).json({ success: true, donation: newDonation });
  });

  // ==========================================
  // READING LISTS REST API
  // ==========================================
  app.get("/api/reading-list", requireAuth, (req: Request, res: Response) => {
    const db = getDb();
    const authUser = (req as any).user;
    const userList = (db.readingLists || []).filter((r: any) => r.userId === authUser.id);
    const postIds = userList.map((r: any) => r.postId);
    const posts = (db.posts || []).filter((p: any) => postIds.includes(p.id));
    res.json({ success: true, readingList: userList, posts });
  });

  app.post("/api/reading-list", requireAuth, (req: Request, res: Response) => {
    const db = getDb();
    const authUser = (req as any).user;
    const { postId } = req.body;
    if (!postId) return res.status(400).json({ error: "Post ID is required" });

    db.readingLists = db.readingLists || [];
    const exists = db.readingLists.some((r: any) => r.userId === authUser.id && r.postId === postId);
    if (exists) {
      db.readingLists = db.readingLists.filter((r: any) => !(r.userId === authUser.id && r.postId === postId));
      saveDatabase();
      return res.json({ success: true, saved: false, message: "Removed from reading list" });
    }

    const entry = {
      id: 'rl_' + Date.now(),
      userId: authUser.id,
      postId,
      savedAt: new Date().toISOString()
    };
    db.readingLists.unshift(entry);
    saveDatabase();
    res.status(201).json({ success: true, saved: true, entry });
  });

  // ==========================================
  // FOLLOWERS REST API
  // ==========================================
  app.get("/api/followers/:authorId", (req: Request, res: Response) => {
    const db = getDb();
    const authorId = req.params.authorId;
    const followers = (db.followers || []).filter((f: any) => f.authorId === authorId);
    res.json({ success: true, count: followers.length, followers });
  });

  app.post("/api/followers/:authorId/toggle", requireAuth, (req: Request, res: Response) => {
    const db = getDb();
    const authUser = (req as any).user;
    const authorId = req.params.authorId;

    if (authUser.id === authorId) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    db.followers = db.followers || [];
    const idx = db.followers.findIndex((f: any) => f.authorId === authorId && f.followerId === authUser.id);
    let isFollowing = false;

    if (idx !== -1) {
      db.followers.splice(idx, 1);
      isFollowing = false;
    } else {
      db.followers.push({
        id: 'fol_' + Date.now(),
        authorId,
        followerId: authUser.id,
        followedAt: new Date().toISOString().split('T')[0]
      });
      isFollowing = true;
    }

    saveDatabase();
    const count = db.followers.filter((f: any) => f.authorId === authorId).length;
    res.json({ success: true, isFollowing, count });
  });

  // ==========================================
  // PROFILE AVATAR UPLOADS REST API
  // ==========================================
  app.post("/api/profile/upload", requireAuth, avatarUpload.single("avatar") as any, async (req: Request, res: Response) => {
    try {
      const file = req.file;
      const authUser = (req as any).user;

      if (!file || !file.buffer) {
        return res.status(400).json({ error: "No image file provided in upload" });
      }

      const bufferValidation = isValidImageBuffer(file.buffer);
      if (!bufferValidation.valid) {
        return res.status(400).json({ error: "Security Error: Invalid or corrupt image file format. Only valid JPEG, PNG, and WebP images are permitted." });
      }

      let avatarUrl = "";
      const status = getCloudinaryStatus();

      if (status.configured) {
        try {
          const uploadPromise = new Promise<{ secure_url: string }>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: "blogge/avatars",
                transformation: [
                  { width: 400, height: 400, crop: "fill", gravity: "face" },
                  { quality: "auto" },
                  { fetch_format: "auto" }
                ]
              },
              (error, result) => {
                if (error) return reject(error);
                if (result && result.secure_url) return resolve({ secure_url: result.secure_url });
                reject(new Error("Cloudinary upload returned empty response"));
              }
            );
            stream.end(file.buffer);
          });

          const cloudRes = await uploadPromise;
          avatarUrl = cloudRes.secure_url;
          console.log("[Profile Upload] Successfully uploaded to Cloudinary:", avatarUrl);
        } catch (cloudErr) {
          console.warn("[Profile Upload] Cloudinary upload failed, using local storage fallback:", cloudErr);
        }
      }

      // Local storage fallback
      if (!avatarUrl) {
        const ext = bufferValidation.format || (file.mimetype.includes('png') ? 'png' : file.mimetype.includes('webp') ? 'webp' : 'jpg');
        const filename = `avatar_${authUser.id}_${Date.now()}.${ext}`;
        const localPath = path.join(avatarsDir, filename);
        fs.writeFileSync(localPath, file.buffer);
        avatarUrl = `/uploads/avatars/${filename}`;
        console.log("[Profile Upload] Saved to local storage:", avatarUrl);
      }

      // Update user avatar in DB
      const db = getDb();
      const user = db.users.find((u: any) => u.id === authUser.id);
      if (user) {
        user.avatar = avatarUrl;
        user.avatarUrl = avatarUrl;
        user.profileImageUrl = avatarUrl;
        saveDatabase();
      }

      return res.status(200).json({
        success: true,
        avatarUrl,
        user: user ? {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: avatarUrl,
          bio: user.bio
        } : null
      });
    } catch (err: any) {
      console.error("[Profile Upload Error]:", err);
      if (err.message === "INVALID_FILE_FORMAT") {
        return res.status(400).json({ error: "Invalid file type. Please upload a valid JPEG, PNG, or WebP image." });
      }
      return res.status(500).json({ error: "Failed to upload image. Please try again." });
    }
  });

  // ==========================================
  // GEMINI AI INTEGRATION REST API
  // ==========================================
  app.post("/api/ai/write", requireAuthorOrAdmin, async (req: Request, res: Response) => {
    try {
      const clientIp = req.ip || '127.0.0.1';
      if (!checkRateLimit(`ai_${clientIp}`, 30, 10 * 60 * 1000)) {
        return res.status(429).json({ error: "AI rate limit exceeded. Please wait a few moments." });
      }

      const { prompt, topic, language = 'bn', tone = 'informative', length = 'medium' } = req.body;
      if (!prompt && !topic) {
        return res.status(400).json({ error: "Prompt or topic is required." });
      }

      const rawInput = `${prompt || ''} ${topic || ''}`;
      if (rawInput.length > 8000) {
        return res.status(400).json({ error: "Prompt payload is too large (maximum 8,000 characters)." });
      }

      const ai = getGenAI();
      if (!ai) {
        return res.status(503).json({ 
          error: "Gemini API key is not configured on the server. Please set GEMINI_API_KEY environment variable." 
        });
      }

      const lengthInstructions = length === 'short' 
        ? 'প্রায় ৩০০-৪০০ শব্দের সংক্ষিপ্ত পোস্ট।'
        : length === 'long'
        ? 'প্রায় ১০০০+ শব্দের গভীর বিশ্লেষণমূলক পোস্ট।'
        : 'প্রায় ৬০০-৮০০ শব্দের সুগঠিত পোস্ট।';

      const langInstruction = language === 'bn' 
        ? 'সম্পূর্ণ কনটেন্টটি প্রাঞ্জল ও সমৃদ্ধ বাংলা ভাষায় লিখুন।'
        : 'Write the entire content in polished, engaging English.';

      const systemPrompt = `You are an expert professional blog writer for the Blogge publishing platform.
Write a comprehensive, engaging, SEO-optimized blog post based on the user's topic and specifications.
Tone: ${tone}.
Length: ${lengthInstructions}
Language: ${langInstruction}

Return your response in clean JSON matching this exact structure:
{
  "title": "A captivating, catchy title",
  "summary": "A 2-3 sentence engaging summary/excerpt",
  "content": "Rich HTML content using <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <blockquote> without <html> or <body> tags",
  "tags": ["3-5 relevant tags"],
  "metaTitle": "SEO title under 60 chars",
  "metaDescription": "SEO description under 160 chars"
}`;

      const userMessage = prompt ? `Topic & Instructions: ${prompt}` : `Topic: ${topic}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Request: ${userMessage}` }] }
        ]
      });

      const responseText = response.text || '';
      let parsedData: any = null;

      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        }
      } catch {
        parsedData = {
          title: topic || 'New AI Generated Post',
          summary: responseText.slice(0, 150),
          content: `<p>${responseText.replace(/\n\n/g, '</p><p>')}</p>`,
          tags: ['AI', 'Blogging'],
          metaTitle: `${topic || 'Blog Post'} | Blogge`,
          metaDescription: responseText.slice(0, 150)
        };
      }

      // Sanitize AI-generated HTML
      if (parsedData.content) {
        parsedData.content = sanitizeHtml(parsedData.content);
      }
      if (parsedData.title) {
        parsedData.title = sanitizeHtml(parsedData.title);
      }

      return res.json({ success: true, data: parsedData });
    } catch (err: any) {
      console.error("[AI Write Error]:", err);
      return res.status(500).json({ error: err.message || "Failed to generate content with AI." });
    }
  });

  app.post("/api/ai/seo", requireAuthorOrAdmin, async (req: Request, res: Response) => {
    try {
      const { title, content } = req.body;
      if (!title) return res.status(400).json({ error: "Title is required for SEO generation." });

      const ai = getGenAI();
      if (!ai) {
        return res.status(503).json({ error: "Gemini API key is not configured on the server." });
      }

      const prompt = `Analyze this blog post and generate high-ranking SEO metadata and improvements:
Title: ${title}
Content snippet: ${(content || '').slice(0, 1000)}

Return JSON:
{
  "metaTitle": "Optimal SEO title under 60 chars",
  "metaDescription": "Optimal meta description under 160 chars",
  "keywords": ["5-8 targeted keywords"],
  "seoScore": 85,
  "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });

      const responseText = response.text || '';
      let parsed = {
        metaTitle: `${title} | Blogge`,
        metaDescription: (content || title).slice(0, 150),
        keywords: ['Blogge', 'Blogging'],
        seoScore: 88,
        suggestions: ['Add subheadings with targeted keywords', 'Optimize image alt text']
      };

      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
      } catch {}

      return res.json({ success: true, data: parsed });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "SEO analysis failed." });
    }
  });

  app.post("/api/ai/translate", requireAuthorOrAdmin, async (req: Request, res: Response) => {
    try {
      const { title, content, targetLanguage = 'en' } = req.body;
      if (!title && !content) return res.status(400).json({ error: "Title or content required." });

      const ai = getGenAI();
      if (!ai) return res.status(503).json({ error: "Gemini API key not configured." });

      const prompt = `Translate the following blog post title and HTML content accurately into ${targetLanguage === 'en' ? 'English' : 'Bengali'}.
Preserve all HTML tags and formatting intact.
Title: ${title || ''}
Content: ${content || ''}

Return JSON:
{
  "translatedTitle": "...",
  "translatedContent": "..."
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });

      let parsed = { translatedTitle: title, translatedContent: content };
      try {
        const match = (response.text || '').match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
      } catch {}

      if (parsed.translatedContent) {
        parsed.translatedContent = sanitizeHtml(parsed.translatedContent);
      }

      return res.json({ success: true, data: parsed });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Translation failed." });
    }
  });

  // ==========================================
  // AUTHENTICATION REST API
  // ==========================================
  app.post("/api/auth/register", (req: Request, res: Response) => {
    const clientIp = req.ip || '127.0.0.1';
    if (!checkRateLimit(`register_${clientIp}`, 10, 15 * 60 * 1000)) {
      return res.status(429).json({ error: "Too many registration attempts. Please try again later." });
    }

    const db = getDb();
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = db.users.find((u: any) => u.email && u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    // Role Enforcement: Public registration CANNOT grant admin role
    const assignedRole = isEmailAdmin(normalizedEmail) ? 'admin' : 'reader';
    const salt = crypto.randomBytes(32).toString("hex");
    const passwordHash = hashPassword(password, salt);
    const cleanName = sanitizeHtml(name.trim());
    const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanName)}`;

    const newUser = {
      id: 'usr_' + Date.now(),
      name: cleanName,
      email: normalizedEmail,
      avatar: defaultAvatar,
      avatarUrl: defaultAvatar,
      profileImageUrl: defaultAvatar,
      bio: 'New Blogge platform community member.',
      role: assignedRole,
      status: 'active',
      twoFactorEnabled: false,
      tokenVersion: 0,
      salt,
      passwordHash,
      joinedAt: new Date().toISOString().split('T')[0]
    };

    db.users.push(newUser);
    logActivity(newUser.id, newUser.name, 'USER_REGISTER', 'নতুন ইউজার রেজিস্ট্রেশন', `User registered: ${newUser.email}`);
    saveDatabase();

    const token = createSessionToken(newUser);
    const { passwordHash: _, salt: __, ...safeUser } = newUser;

    res.status(201).json({
      success: true,
      token,
      user: safeUser
    });
  });

  app.post("/api/auth/login", (req: Request, res: Response) => {
    const clientIp = req.ip || '127.0.0.1';
    if (!checkRateLimit(`login_${clientIp}`, 15, 15 * 60 * 1000)) {
      return res.status(429).json({ error: "Too many login attempts. Please try again after 15 minutes." });
    }

    const db = getDb();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = db.users.find((u: any) => u.email && u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    if (user.status === 'banned') {
      return res.status(403).json({ error: "This account has been suspended by the platform administrator." });
    }

    const isMatch = verifyAndMigratePassword(password, user);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Role Enforcement: Ensure admin privilege matches ADMIN_EMAIL
    if (isEmailAdmin(user.email)) {
      user.role = 'admin';
    } else if (user.role === 'admin') {
      user.role = 'reader';
    }

    const token = createSessionToken(user);
    logActivity(user.id, user.name, 'USER_LOGIN', 'ইউজার লগইন', `User logged in: ${user.email}`);

    const { passwordHash: _, salt: __, resetTokenHash: ___, ...safeUser } = user;

    res.json({
      success: true,
      token,
      user: safeUser
    });
  });

  app.post("/api/auth/google", async (req: Request, res: Response) => {
    const { idToken, email, name, avatar } = req.body;
    const db = getDb();

    let verifiedEmail = email ? email.trim().toLowerCase() : '';
    let verifiedName = name ? name.trim() : '';
    let verifiedAvatar = avatar;

    if (idToken) {
      const verified = await verifyGoogleOrFirebaseIdToken(idToken);
      if (verified && verified.email) {
        verifiedEmail = verified.email;
        if (verified.name) verifiedName = verified.name;
        if (verified.avatar) verifiedAvatar = verified.avatar;
      } else {
        return res.status(401).json({ error: "Invalid or expired Google / Firebase authentication token." });
      }
    }

    if (!verifiedEmail) {
      return res.status(400).json({ error: "Valid verified email is required for authentication." });
    }

    let user = db.users.find((u: any) => u.email && u.email.toLowerCase() === verifiedEmail);

    if (!user) {
      const assignedRole = isEmailAdmin(verifiedEmail) ? 'admin' : 'reader';
      const salt = crypto.randomBytes(32).toString("hex");
      const passwordHash = hashPassword(crypto.randomBytes(32).toString("hex"), salt);
      const safeAvatar = verifiedAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(verifiedName || verifiedEmail)}`;

      user = {
        id: 'usr_' + Date.now(),
        name: verifiedName || verifiedEmail.split('@')[0],
        email: verifiedEmail,
        avatar: safeAvatar,
        avatarUrl: safeAvatar,
        profileImageUrl: safeAvatar,
        bio: 'Blogger platform member authenticated via Google.',
        role: assignedRole,
        status: 'active',
        twoFactorEnabled: false,
        authProvider: 'google',
        tokenVersion: 0,
        salt,
        passwordHash,
        joinedAt: new Date().toISOString().split('T')[0]
      };
      db.users.push(user);
      logActivity(user.id, user.name, 'USER_REGISTER_GOOGLE', 'গুগল রেজিস্ট্রেশন', `User registered via Google: ${user.email}`);
      saveDatabase();
    } else {
      if (user.status === 'banned') {
        return res.status(403).json({ error: "Account suspended." });
      }
      if (isEmailAdmin(user.email)) {
        user.role = 'admin';
      } else if (user.role === 'admin') {
        user.role = 'reader';
      }
      if (verifiedAvatar && (!user.avatar || user.avatar.includes('dicebear'))) {
        user.avatar = verifiedAvatar;
        user.avatarUrl = verifiedAvatar;
        user.profileImageUrl = verifiedAvatar;
        saveDatabase();
      }
    }

    const token = createSessionToken(user);
    const { passwordHash: _, salt: __, resetTokenHash: ___, ...safeUser } = user;

    res.json({
      success: true,
      token,
      user: safeUser
    });
  });

  app.get("/api/auth/me", requireAuth, (req: Request, res: Response) => {
    const authUser = (req as any).user;
    const db = getDb();
    const user = db.users.find((u: any) => u.id === authUser.id);
    if (!user) {
      return res.status(404).json({ error: "User profile not found." });
    }

    if (isEmailAdmin(user.email)) {
      user.role = 'admin';
    } else if (user.role === 'admin') {
      user.role = 'reader';
    }

    const { passwordHash: _, salt: __, resetTokenHash: ___, ...safeUser } = user;
    res.json({
      success: true,
      user: safeUser
    });
  });

  // Password Reset Request (Enumeration-safe & Transactional Email)
  app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
    const clientIp = req.ip || '127.0.0.1';
    if (!checkRateLimit(`forgot_pw_${clientIp}`, 5, 15 * 60 * 1000)) {
      return res.status(429).json({ error: "Too many password reset requests. Please try again after 15 minutes." });
    }

    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: "Email address is required." });
    }

    const normEmail = email.trim().toLowerCase();
    const db = getDb();
    const user = db.users.find((u: any) => u.email && u.email.toLowerCase() === normEmail);

    if (user && user.status !== 'banned') {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      user.resetTokenHash = tokenHash;
      user.resetTokenExpiry = Date.now() + 3600 * 1000; // 1 hour expiration
      user.resetTokenUsed = false;
      saveDatabase();

      logActivity(user.id, user.name, 'PASSWORD_RESET_REQUEST', 'পাসওয়ার্ড রিসেট অনুরোধ', `Password reset token issued for ${normEmail}`);

      // Dispatch transactional email asynchronously without blocking or leaking error
      sendPasswordResetEmail(normEmail, rawToken).catch(err => {
        console.error("[Forgot Password Email Error]:", err);
      });
    }

    // Always return generic success to prevent account enumeration
    res.json({
      success: true,
      message: "যদি আপনার ইমেইলটি নিবন্ধিত থাকে, তবে পাসওয়ার্ড রিসেট করার একটি লিংক পাঠানো হয়েছে।"
    });
  });

  // Password Reset Completion with Token Verification
  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    const clientIp = req.ip || '127.0.0.1';
    if (!checkRateLimit(`reset_pw_submit_${clientIp}`, 10, 15 * 60 * 1000)) {
      return res.status(429).json({ error: "Too many attempts. Please try again later." });
    }

    const { token, newPassword } = req.body;
    if (!token || typeof token !== 'string' || !newPassword || typeof newPassword !== 'string') {
      return res.status(400).json({ error: "Token and new password are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
    const db = getDb();
    const user = db.users.find((u: any) => u.resetTokenHash === tokenHash);

    if (!user || user.resetTokenUsed || !user.resetTokenExpiry || Date.now() > user.resetTokenExpiry) {
      return res.status(400).json({ error: "পাসওয়ার্ড রিসেট টোকেনটি অবৈধ বা মেয়াদোত্তীর্ণ হয়ে গেছে।" });
    }

    // Apply new PBKDF2-SHA512 password hash
    user.salt = crypto.randomBytes(32).toString("hex");
    user.passwordHash = hashPasswordStrong(newPassword, user.salt);
    user.resetTokenUsed = true;
    user.resetTokenHash = null;
    user.resetTokenExpiry = null;
    user.passwordChangedAt = new Date().toISOString();
    user.tokenVersion = (user.tokenVersion || 0) + 1; // Invalidate all prior sessions

    saveDatabase();
    logActivity(user.id, user.name, 'PASSWORD_RESET_SUCCESS', 'পাসওয়ার্ড সফলভাবে পরিবর্তিত', `Password reset completed for ${user.email}`);

    res.json({
      success: true,
      message: "আপনার পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে। নতুন পাসওয়ার্ড দিয়ে লগইন করুন।"
    });
  });

  // User Profile Update REST API
  app.put("/api/auth/profile", requireAuth, (req: Request, res: Response) => {
    const authUser = (req as any).user;
    const db = getDb();
    const user = db.users.find((u: any) => u.id === authUser.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const { name, bio, avatar, twoFactorEnabled } = req.body;

    if (name) user.name = sanitizeHtml(name.trim());
    if (bio !== undefined) user.bio = sanitizeHtml(bio);
    if (avatar) {
      user.avatar = avatar;
      user.avatarUrl = avatar;
      user.profileImageUrl = avatar;
    }
    if (typeof twoFactorEnabled === 'boolean') user.twoFactorEnabled = twoFactorEnabled;

    saveDatabase();
    logActivity(user.id, user.name, 'PROFILE_UPDATE', 'প্রোফাইল আপডেট', 'User profile information updated');

    const { passwordHash: _, salt: __, resetTokenHash: ___, ...safeUser } = user;
    res.json({
      success: true,
      user: safeUser
    });
  });

  // Admin User Management REST API
  app.get("/api/admin/users", requireAdminAuth, (_req: Request, res: Response) => {
    const db = getDb();
    const sanitized = (db.users || []).map((u: any) => {
      const { passwordHash: _, salt: __, resetTokenHash: ___, ...safe } = u;
      return safe;
    });
    res.json({ success: true, users: sanitized });
  });

  app.put("/api/admin/users/:id/role", requireAdminAuth, (req: Request, res: Response) => {
    const db = getDb();
    const target = db.users.find((u: any) => u.id === req.params.id);
    if (!target) return res.status(404).json({ error: "User not found" });

    const { role } = req.body;
    if (!['admin', 'editor', 'author', 'reader'].includes(role)) {
      return res.status(400).json({ error: "Invalid role specified." });
    }

    // Role Enforcement: Cannot assign admin role unless user email matches ADMIN_EMAIL
    if (role === 'admin' && !isEmailAdmin(target.email)) {
      return res.status(403).json({ error: "Forbidden: Administrator role is restricted to configured ADMIN_EMAIL." });
    }

    target.role = role;
    saveDatabase();
    logActivity('usr_admin', 'Admin', 'USER_ROLE_CHANGE', 'ইউজার রোল পরিবর্তন', `Changed role of ${target.email} to ${role}`);

    const { passwordHash: _, salt: __, resetTokenHash: ___, ...safe } = target;
    res.json({ success: true, user: safe });
  });

  app.put("/api/admin/users/:id/status", requireAdminAuth, (req: Request, res: Response) => {
    const db = getDb();
    const target = db.users.find((u: any) => u.id === req.params.id);
    if (!target) return res.status(404).json({ error: "User not found" });

    if (isEmailAdmin(target.email)) {
      return res.status(400).json({ error: "Primary administrator account status cannot be modified." });
    }

    const { status } = req.body;
    if (!['active', 'banned'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    target.status = status;
    saveDatabase();
    logActivity('usr_admin', 'Admin', 'USER_STATUS_CHANGE', 'ইউজার স্ট্যাটাস পরিবর্তন', `${target.email} marked as ${status}`);

    const { passwordHash: _, salt: __, resetTokenHash: ___, ...safe } = target;
    res.json({ success: true, user: safe });
  });

  // Dedicated APK Download Endpoints
  const apkDownloadHandler = (_req: Request, res: Response) => {
    const candidates = [
      path.join(process.cwd(), 'APK_DOWNLOAD', 'app-debug.apk'),
      path.join(process.cwd(), 'public', 'app-debug.apk'),
      path.join(process.cwd(), 'dist', 'app-debug.apk'),
      path.join(process.cwd(), '.build-outputs', 'app-debug.apk')
    ];
    for (const filePath of candidates) {
      if (fs.existsSync(filePath)) {
        res.setHeader('Content-Type', 'application/vnd.android.package-archive');
        res.setHeader('Content-Disposition', 'attachment; filename="app-debug.apk"');
        return res.sendFile(filePath);
      }
    }
    return res.status(404).json({ error: 'APK binary file not found' });
  };

  const apkEndpoints = [
    '/APK_DOWNLOAD',
    '/APK_DOWNLOAD/',
    '/APK_DOWNLOAD/app-debug.apk',
    '/APK_DOWNLOAD/:filename',
    '/apk_download',
    '/apk_download/',
    '/apk_download/app-debug.apk',
    '/apk_download/:filename',
    '/app-debug.apk',
    '/api/download/apk',
    '/download/apk',
    '/api/apk'
  ];

  apkEndpoints.forEach(endpoint => {
    app.get(endpoint, apkDownloadHandler);
  });

  // Catch any direct .apk download request
  app.get('*.apk', apkDownloadHandler);

  // Vite Middleware in Development / Static Serving in Production
  if (!options.skipVite) {
    if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  return app;
}

export async function startServer() {
  const app = await createApp();
  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Blogge Server] Listening on http://localhost:${PORT}`);
  });
}

// Auto-start when executed directly as main script
const scriptPath = process.argv[1] || '';
const isMain = scriptPath.endsWith('server.ts') || 
  scriptPath.endsWith('server.cjs') || 
  scriptPath.endsWith('server.js') ||
  (process.env.npm_lifecycle_event === 'dev' && !scriptPath.includes('test'));

if (isMain && !scriptPath.includes('test') && !scriptPath.includes('integration')) {
  startServer();
}
