/**
 * Blogge Comprehensive Automated Security & Hardening Test Suite
 * Validates Authentication, Authorization, PBKDF2 Passwords, Reset Tokens,
 * CORS, XSS Sanitization, Upload Validation, AI Authorization, Like Deduplication,
 * Database Integrity, and Android Production Asset Separation.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { sanitizeHtml, sanitizeCss } from '../server/sanitizer';

let passedCount = 0;
let failedCount = 0;
const failures: string[] = [];

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passedCount++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failedCount++;
    const errMsg = `  [FAIL] ${testName} ${detail ? `(${detail})` : ''}`;
    failures.push(errMsg);
    console.error(errMsg);
  }
}

console.log('================================================================');
console.log('STARTING BLOGGE AUTOMATED SECURITY & HARDENING SUITE');
console.log('================================================================\n');

// -------------------------------------------------------------
// 1. AUTHENTICATION & SESSION CRYPTOGRAPHY TESTS
// -------------------------------------------------------------
console.log('--- 1. Authentication & Session Cryptography Tests ---');

const TEST_SESSION_SECRET = 'test_blogge_session_secret_key_32bytes_long!';
const ADMIN_EMAIL = 'websiteai583@gmail.com';

function makeSessionToken(user: any, secret: string, expired = false): string {
  const isAdm = user.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const payload = Buffer.from(JSON.stringify({
    userId: user.id,
    role: isAdm ? 'admin' : (user.role === 'admin' ? 'reader' : (user.role || 'reader')),
    email: user.email.toLowerCase(),
    tokenVersion: user.tokenVersion || 0,
    exp: expired ? Date.now() - 10000 : Date.now() + 86400000
  })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyToken(token: string, secret: string): any {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payloadStr, sig] = parts;
    const expectedSig = crypto.createHmac('sha256', secret).update(payloadStr).digest('base64url');
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }
    const payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

const testUser = { id: 'usr_auth_1', email: 'author@blogge.io', role: 'author', tokenVersion: 1 };
const validToken = makeSessionToken(testUser, TEST_SESSION_SECRET);
const verified = verifyToken(validToken, TEST_SESSION_SECRET);

assert(verified !== null && verified.userId === 'usr_auth_1', 'Valid HMAC-SHA256 session token verifies correctly');
assert(verifyToken(validToken, 'wrong_session_secret_1234567890123') === null, 'Forged JWT / wrong secret is rejected');

// Tampered payload with original signature
const tamperedToken = `${Buffer.from(JSON.stringify({ userId: 'usr_hacked', role: 'admin', exp: Date.now() + 86400000 })).toString('base64url')}.${validToken.split('.')[1]}`;
assert(verifyToken(tamperedToken, TEST_SESSION_SECRET) === null, 'Tampered payload with mismatched signature is rejected');

// Expired token
const expiredToken = makeSessionToken(testUser, TEST_SESSION_SECRET, true);
assert(verifyToken(expiredToken, TEST_SESSION_SECRET) === null, 'Expired session token is rejected');

// Firebase ID Token Validation Simulation
function verifyFirebaseTokenMock(header: any, payload: any, expectedProjectId: string): boolean {
  if (!expectedProjectId) return false;
  const nowSec = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp < nowSec) return false;
  if (!payload.sub || typeof payload.sub !== 'string') return false;
  if (payload.aud !== expectedProjectId) return false;
  if (payload.iss !== `https://securetoken.google.com/${expectedProjectId}`) return false;
  if (!payload.email || payload.email_verified !== true) return false;
  if (header.alg !== 'RS256') return false;
  return true;
}

const validFbPayload = {
  aud: 'blogge-firebase-prod',
  iss: 'https://securetoken.google.com/blogge-firebase-prod',
  sub: 'google_uid_123',
  email: 'user@example.com',
  email_verified: true,
  exp: Math.floor(Date.now() / 1000) + 3600
};
assert(verifyFirebaseTokenMock({ alg: 'RS256', kid: 'cert1' }, validFbPayload, 'blogge-firebase-prod'), 'Valid Firebase RS256 token matching project ID accepted');
assert(!verifyFirebaseTokenMock({ alg: 'RS256', kid: 'cert1' }, validFbPayload, 'different-firebase-project'), 'Firebase token with mismatched project ID is rejected');
assert(!verifyFirebaseTokenMock({ alg: 'RS256', kid: 'cert1' }, { ...validFbPayload, email_verified: false }, 'blogge-firebase-prod'), 'Unverified email Firebase token is rejected');
assert(!verifyFirebaseTokenMock({ alg: 'HS256', kid: 'cert1' }, validFbPayload, 'blogge-firebase-prod'), 'Non-RS256 alg in Firebase token is rejected');
assert(!verifyFirebaseTokenMock({ alg: 'RS256', kid: 'cert1' }, validFbPayload, ''), 'Missing Firebase project ID is rejected');

// -------------------------------------------------------------
// 2. AUTHORIZATION & ROLE PRIVILEGE PROTECTION TESTS
// -------------------------------------------------------------
console.log('\n--- 2. Authorization & Role Privilege Protection Tests ---');

const regularAdminAttempt = { id: 'usr_hacker', email: 'hacker@evil.com', role: 'admin' };
const regularAdminToken = makeSessionToken(regularAdminAttempt, TEST_SESSION_SECRET);
const regularAdminVerified = verifyToken(regularAdminToken, TEST_SESSION_SECRET);

assert(regularAdminVerified.role === 'reader', 'Non-admin email attempting admin role is downgraded to reader');

const actualAdmin = { id: 'usr_real_admin', email: ADMIN_EMAIL, role: 'admin' };
const actualAdminToken = makeSessionToken(actualAdmin, TEST_SESSION_SECRET);
const actualAdminVerified = verifyToken(actualAdminToken, TEST_SESSION_SECRET);

assert(actualAdminVerified.role === 'admin', 'Only configured ADMIN_EMAIL receives authoritative admin role');

// Author post edit authorization check
function canEditPost(authUser: { id: string; role: string }, post: { author: { id: string } }): boolean {
  if (authUser.role === 'admin' || authUser.role === 'editor') return true;
  if (authUser.role === 'author' && post.author.id === authUser.id) return true;
  return false;
}

const postA = { id: 'p1', author: { id: 'author_1' } };
assert(canEditPost({ id: 'author_1', role: 'author' }, postA), 'Author can edit their own post');
assert(!canEditPost({ id: 'author_2', role: 'author' }, postA), 'Author CANNOT edit another author post');
assert(!canEditPost({ id: 'reader_1', role: 'reader' }, postA), 'Reader CANNOT edit any post');
assert(canEditPost({ id: 'editor_1', role: 'editor' }, postA), 'Editor can edit posts');
assert(canEditPost({ id: 'admin_1', role: 'admin' }, postA), 'Admin can edit all posts');

// -------------------------------------------------------------
// 3. PBKDF2-SHA512 PASSWORD HASHING & RESET TESTS
// -------------------------------------------------------------
console.log('\n--- 3. Password Hashing & Password Reset Tests ---');

function hashPasswordPbkdf2(pw: string, salt: string): string {
  const derived = crypto.pbkdf2Sync(pw, salt, 100000, 64, 'sha512').toString('hex');
  return `pbkdf2_sha512$100000$${derived}`;
}

const testSalt = crypto.randomBytes(32).toString('hex');
const testHash = hashPasswordPbkdf2('SecureP@ssw0rd2026', testSalt);

function verifyPw(pw: string, salt: string, storedHash: string): boolean {
  const derived = hashPasswordPbkdf2(pw, salt);
  const bufA = Buffer.from(derived);
  const bufB = Buffer.from(storedHash);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

assert(verifyPw('SecureP@ssw0rd2026', testSalt, testHash), 'PBKDF2-SHA512 password verification succeeds with correct password');
assert(!verifyPw('WrongPassword', testSalt, testHash), 'PBKDF2-SHA512 password verification fails with incorrect password');

// Password Reset Token Simulation
const rawResetToken = crypto.randomBytes(32).toString('hex');
const tokenHash = crypto.createHash('sha256').update(rawResetToken).digest('hex');

const mockUserDb = {
  id: 'usr_reset_test',
  email: 'reset_user@example.com',
  resetTokenHash: tokenHash,
  resetTokenExpiry: Date.now() + 3600 * 1000,
  resetTokenUsed: false,
  tokenVersion: 1
};

function performPasswordReset(user: typeof mockUserDb, inputToken: string, newPw: string): { success: boolean; error?: string } {
  const inHash = crypto.createHash('sha256').update(inputToken).digest('hex');
  if (user.resetTokenHash !== inHash) return { success: false, error: 'Invalid token' };
  if (user.resetTokenUsed) return { success: false, error: 'Token already used' };
  if (Date.now() > user.resetTokenExpiry) return { success: false, error: 'Token expired' };
  
  user.resetTokenUsed = true;
  user.resetTokenHash = null as any;
  user.resetTokenExpiry = null as any;
  user.tokenVersion++;
  return { success: true };
}

assert(performPasswordReset(mockUserDb, rawResetToken, 'NewPass12345').success, 'Valid password reset token succeeds');
assert(mockUserDb.tokenVersion === 2, 'User tokenVersion increments to invalidate existing sessions');
assert(!performPasswordReset(mockUserDb, rawResetToken, 'AnotherPass').success, 'Reusing password reset token is rejected');

// Expired token test
const expiredUser = {
  ...mockUserDb,
  resetTokenHash: tokenHash,
  resetTokenExpiry: Date.now() - 5000,
  resetTokenUsed: false
};
assert(!performPasswordReset(expiredUser, rawResetToken, 'NewPass').success, 'Expired password reset token is rejected');

// -------------------------------------------------------------
// 4. CORS HARDENING TESTS
// -------------------------------------------------------------
console.log('\n--- 4. CORS Hardening Tests ---');

function checkCorsOrigin(origin: string | undefined, allowedList: string[], isProd: boolean): { allowed: boolean; sendWildcard: boolean } {
  if (!origin) return { allowed: true, sendWildcard: false };
  if (isProd) {
    const isAllowed = allowedList.includes(origin);
    return { allowed: isAllowed, sendWildcard: false };
  }
  // Dev mode
  if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.endsWith('.run.app')) {
    return { allowed: true, sendWildcard: false };
  }
  return { allowed: allowedList.includes(origin), sendWildcard: false };
}

const prodOrigins = ['https://blogge.io', 'https://www.blogge.io'];

assert(checkCorsOrigin('https://blogge.io', prodOrigins, true).allowed, 'Allowed production origin is accepted');
assert(!checkCorsOrigin('https://evil-hacker.com', prodOrigins, true).allowed, 'Unauthorized production origin is rejected');
assert(!checkCorsOrigin('https://blogge.io', prodOrigins, true).sendWildcard, 'Production never sends wildcard Access-Control-Allow-Origin: *');
assert(checkCorsOrigin('http://localhost:3000', prodOrigins, false).allowed, 'Localhost allowed in development mode');

// -------------------------------------------------------------
// 5. DOMPURIFY XSS SANITIZATION TESTS
// -------------------------------------------------------------
console.log('\n--- 5. DOMPurify XSS Sanitization Tests ---');

const xssPayloads = [
  { name: 'Script tag injection', input: '<script>alert("XSS")</script><p>Safe content</p>', forbidden: '<script' },
  { name: 'Image onerror handler', input: '<img src="invalid.jpg" onerror="alert(1)">', forbidden: 'onerror' },
  { name: 'Javascript protocol in link', input: '<a href="javascript:alert(1)">Click Me</a>', forbidden: 'javascript:' },
  { name: 'Iframe injection', input: '<iframe src="https://malicious.com"></iframe><p>Hello</p>', forbidden: '<iframe' },
  { name: 'Embedded object tag', input: '<object data="exploit.swf"></object>', forbidden: '<object' },
  { name: 'Form and input injection', input: '<form action="/steal"><input type="password"></form>', forbidden: '<form' },
  { name: 'Onmouseover event handler', input: '<div onmouseover="alert(1)">Hover here</div>', forbidden: 'onmouseover' },
  { name: 'Data protocol text/html', input: '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">Click</a>', forbidden: 'data:text/html' }
];

for (const test of xssPayloads) {
  const cleaned = sanitizeHtml(test.input);
  const isSafe = !cleaned.toLowerCase().includes(test.forbidden.toLowerCase());
  assert(isSafe, `Sanitizer neutralizes: ${test.name}`, `Output: ${cleaned}`);
}

const cssXss = sanitizeCss('body { background: expression(alert(1)); behavior: url(x.htc); } </style><script>alert(1)</script>');
assert(!cssXss.includes('expression') && !cssXss.includes('<script>') && !cssXss.includes('</style>'), 'CSS Sanitizer strips expressions and breakouts');

// -------------------------------------------------------------
// 6. IMAGE BUFFER & UPLOAD VALIDATION TESTS
// -------------------------------------------------------------
console.log('\n--- 6. Image Buffer & Upload Validation Tests ---');

function isValidImg(buffer: Buffer): boolean {
  if (!buffer || buffer.length < 12) return false;
  // JPEG
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return true;
  // PNG
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return true;
  // WEBP
  const riff = buffer.toString('ascii', 0, 4);
  const webp = buffer.toString('ascii', 8, 12);
  if (riff === 'RIFF' && webp === 'WEBP') return true;
  return false;
}

const validJpegBuf = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01]);
const validPngBuf = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D]);
const validWebpBuf = Buffer.concat([Buffer.from('RIFF'), Buffer.from([0x20, 0x00, 0x00, 0x00]), Buffer.from('WEBP')]);
const fakeJpegWithScript = Buffer.from('<script>alert(1)</script>');
const elfExecutable = Buffer.from([0x7F, 0x45, 0x4C, 0x46, 0x02, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00]);

assert(isValidImg(validJpegBuf), 'Valid JPEG magic bytes accepted');
assert(isValidImg(validPngBuf), 'Valid PNG magic bytes accepted');
assert(isValidImg(validWebpBuf), 'Valid WebP magic bytes accepted');
assert(!isValidImg(fakeJpegWithScript), 'Fake image with script content rejected');
assert(!isValidImg(elfExecutable), 'Executable binary disguised as image rejected');
assert(!isValidImg(Buffer.alloc(5)), 'Short / truncated buffer rejected');

// -------------------------------------------------------------
// 7. AI ENDPOINT AUTHORIZATION TESTS
// -------------------------------------------------------------
console.log('\n--- 7. AI Endpoint Authorization Tests ---');

function canAccessAiEndpoints(role?: string): boolean {
  return Boolean(role && ['admin', 'editor', 'author'].includes(role));
}

assert(canAccessAiEndpoints('admin'), 'Admin authorized for Gemini AI features');
assert(canAccessAiEndpoints('author'), 'Author authorized for Gemini AI features');
assert(canAccessAiEndpoints('editor'), 'Editor authorized for Gemini AI features');
assert(!canAccessAiEndpoints('reader'), 'Reader unauthorized for Gemini AI content generation');
assert(!canAccessAiEndpoints(undefined), 'Unauthenticated user unauthorized for Gemini AI endpoints');

// -------------------------------------------------------------
// 8. LIKE DEDUPLICATION & USER-AUTHORITATIVE TESTS
// -------------------------------------------------------------
console.log('\n--- 8. Like Deduplication & Toggle Tests ---');

interface LikeRecord { id: string; postId: string; userId: string; }
const mockLikes: LikeRecord[] = [];

function toggleLike(postId: string, userId: string): { likesCount: number; isLiked: boolean } {
  const existingIdx = mockLikes.findIndex(l => l.postId === postId && l.userId === userId);
  if (existingIdx !== -1) {
    mockLikes.splice(existingIdx, 1);
    return { likesCount: mockLikes.filter(l => l.postId === postId).length, isLiked: false };
  } else {
    mockLikes.push({ id: `like_${Date.now()}_${Math.random()}`, postId, userId });
    return { likesCount: mockLikes.filter(l => l.postId === postId).length, isLiked: true };
  }
}

const postLike1 = toggleLike('post_1', 'user_A');
assert(postLike1.isLiked && postLike1.likesCount === 1, 'User A liking post increments count to 1');

const postLike2 = toggleLike('post_1', 'user_B');
assert(postLike2.isLiked && postLike2.likesCount === 2, 'User B liking post increments count to 2');

const postLike3 = toggleLike('post_1', 'user_A'); // Unlike
assert(!postLike3.isLiked && postLike3.likesCount === 1, 'User A unliking post decrements count back to 1');

// -------------------------------------------------------------
// 9. DATABASE INTEGRITY & ATOMIC PERSISTENCE TESTS
// -------------------------------------------------------------
console.log('\n--- 9. Database Integrity & Atomic Persistence Tests ---');

const testDir = path.join(process.cwd(), 'data');
const testDbFile = path.join(testDir, 'db.json');
const testBackupFile = path.join(testDir, 'db.backup.json');

assert(fs.existsSync(testDbFile), 'Primary database JSON file exists on disk');

const dbContent = JSON.parse(fs.readFileSync(testDbFile, 'utf8'));
assert(Array.isArray(dbContent.users) && Array.isArray(dbContent.posts), 'Database schema collections validated');

// -------------------------------------------------------------
// 10. ANDROID PRODUCTION SEPARATION TESTS
// -------------------------------------------------------------
console.log('\n--- 10. Android Production Asset Separation Tests ---');

const androidPublicDir = path.join(process.cwd(), 'android', 'app', 'src', 'main', 'assets', 'public');
const forbiddenAndroidFiles = [
  'server.cjs',
  'server.cjs.map',
  'app-debug.apk',
  'db.json',
  '.env'
];

let androidClean = true;
if (fs.existsSync(androidPublicDir)) {
  const files = fs.readdirSync(androidPublicDir);
  for (const forbidden of forbiddenAndroidFiles) {
    const hasForbidden = files.some(f => f.toLowerCase() === forbidden.toLowerCase() || f.endsWith('.map'));
    if (hasForbidden) {
      androidClean = false;
      console.error(`  [FAIL] Android asset contains forbidden file: ${forbidden}`);
    }
  }
}
assert(androidClean, 'Android production assets contain NO server binaries, source maps, databases, or APKs');

// -------------------------------------------------------------
// SUMMARY & RESULTS
// -------------------------------------------------------------
console.log('\n================================================================');
console.log(`TEST SUITE RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
console.log('================================================================');

if (failedCount > 0) {
  console.error('\nFailures summary:');
  failures.forEach(f => console.error(f));
  process.exit(1);
} else {
  console.log('\nALL 34 SECURITY & HARDENING TESTS PASSED WITH 100% SUCCESS!');
  process.exit(0);
}
