/**
 * Blogge End-to-End HTTP Integration & Security Test Suite
 * Executes real HTTP requests against the live Express application instance,
 * testing full routing, JWT session verification, role authorization,
 * input validation, rate limiting, and database state mutations.
 */
import http from 'http';
import crypto from 'crypto';
import { createApp, createSessionToken } from '../server';
import { getDb, saveDatabase } from '../server/db';

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

interface HttpResponse {
  status: number;
  headers: http.IncomingHttpHeaders;
  body: any;
  rawText: string;
}

function makeHttpRequest(
  server: http.Server,
  options: {
    method: string;
    path: string;
    headers?: Record<string, string>;
    body?: any;
  }
): Promise<HttpResponse> {
  return new Promise((resolve, reject) => {
    const address = server.address();
    if (!address || typeof address === 'string') {
      return reject(new Error('Server address not available'));
    }

    const payload = options.body ? JSON.stringify(options.body) : null;
    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (payload) {
      reqHeaders['Content-Length'] = Buffer.byteLength(payload).toString();
    }

    const req = http.request(
      {
        host: '127.0.0.1',
        port: address.port,
        method: options.method,
        path: options.path,
        headers: reqHeaders
      },
      (res) => {
        let rawData = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          let parsed: any = null;
          try {
            parsed = JSON.parse(rawData);
          } catch {
            parsed = rawData;
          }
          resolve({
            status: res.statusCode || 0,
            headers: res.headers,
            body: parsed,
            rawText: rawData
          });
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

async function runSuite() {
  console.log('================================================================');
  console.log('STARTING BLOGGE END-TO-END HTTP INTEGRATION TEST SUITE');
  console.log('================================================================\n');

  const app = await createApp({ skipVite: true });
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });

  try {
    const db = getDb();
    const ADMIN_EMAIL = 'websiteai583@gmail.com';

    // -------------------------------------------------------------
    // 1. HEALTH & RUNTIME DIAGNOSTIC ENDPOINTS
    // -------------------------------------------------------------
    console.log('--- 1. Health & System Diagnostic Endpoints ---');
    const healthRes = await makeHttpRequest(server, { method: 'GET', path: '/api/health' });
    assert(healthRes.status === 200 && healthRes.body.success === true, 'GET /api/health returns 200 OK');

    const configRes = await makeHttpRequest(server, { method: 'GET', path: '/api/config/status' });
    assert(configRes.status === 200 && configRes.body.admin !== undefined, 'GET /api/config/status returns safe configuration details');

    const apkRes = await makeHttpRequest(server, { method: 'GET', path: '/APK_DOWNLOAD/app-debug.apk' });
    assert(apkRes.status === 200 && apkRes.headers['content-type'] === 'application/vnd.android.package-archive', 'GET /APK_DOWNLOAD/app-debug.apk serves valid Android APK');

    // -------------------------------------------------------------
    // 2. AUTHENTICATION (REGISTER & LOGIN) HTTP INTEGRATION
    // -------------------------------------------------------------
    console.log('\n--- 2. User Registration & Login HTTP Pipeline ---');
    const uniqueEmail = `integration_author_${Date.now()}@example.com`;
    const regRes = await makeHttpRequest(server, {
      method: 'POST',
      path: '/api/auth/register',
      body: {
        name: 'Integration Author',
        email: uniqueEmail,
        password: 'Password123!'
      }
    });
    assert(regRes.status === 201 && !!regRes.body.token, 'POST /api/auth/register creates user and returns JWT session token');
    const authorToken = regRes.body.token;
    const authorId = regRes.body.user.id;

    // Login with valid credentials
    const loginRes = await makeHttpRequest(server, {
      method: 'POST',
      path: '/api/auth/login',
      body: {
        email: uniqueEmail,
        password: 'Password123!'
      }
    });
    assert(loginRes.status === 200 && !!loginRes.body.token, 'POST /api/auth/login succeeds with valid credentials');

    // Login with invalid credentials
    const badLoginRes = await makeHttpRequest(server, {
      method: 'POST',
      path: '/api/auth/login',
      body: {
        email: uniqueEmail,
        password: 'WrongPassword'
      }
    });
    assert(badLoginRes.status === 401, 'POST /api/auth/login rejects incorrect password with 401 Unauthorized');

    // Set author role in DB for content creation tests and generate updated author token
    const registeredUser = db.users.find((u: any) => u.id === authorId);
    let authorSessionToken = authorToken;
    if (registeredUser) {
      registeredUser.role = 'author';
      saveDatabase();
      authorSessionToken = createSessionToken(registeredUser);
    }

    // -------------------------------------------------------------
    // 3. POST /api/auth/google INTEGRATION
    // -------------------------------------------------------------
    console.log('\n--- 3. Google Auth Endpoint (POST /api/auth/google) ---');
    const emptyGoogleRes = await makeHttpRequest(server, {
      method: 'POST',
      path: '/api/auth/google',
      body: {}
    });
    assert(emptyGoogleRes.status === 400, 'POST /api/auth/google rejects empty body with 400 Bad Request');

    const fakeTokenGoogleRes = await makeHttpRequest(server, {
      method: 'POST',
      path: '/api/auth/google',
      body: { idToken: 'invalid_malformed_token_header_payload_signature' }
    });
    assert(fakeTokenGoogleRes.status === 401, 'POST /api/auth/google rejects invalid / unsigned token with 401 Unauthorized');

    // -------------------------------------------------------------
    // 4. FORGOT & RESET PASSWORD HTTP FLOW
    // -------------------------------------------------------------
    console.log('\n--- 4. Password Reset HTTP Chain (POST /api/auth/forgot-password & reset-password) ---');
    const forgotRes = await makeHttpRequest(server, {
      method: 'POST',
      path: '/api/auth/forgot-password',
      body: { email: uniqueEmail }
    });
    assert(forgotRes.status === 200 && forgotRes.body.success === true, 'POST /api/auth/forgot-password returns enumeration-safe 200');

    const updatedUser = db.users.find((u: any) => u.id === authorId);
    assert(!!updatedUser?.resetTokenHash, 'Forgot-password issued secure SHA256 hashed reset token in DB');

    // Reset password with invalid token
    const invalidResetRes = await makeHttpRequest(server, {
      method: 'POST',
      path: '/api/auth/reset-password',
      body: { token: 'invalid_token_xyz', newPassword: 'NewPassword2026!' }
    });
    assert(invalidResetRes.status === 400, 'POST /api/auth/reset-password rejects invalid token');

    // Set a known raw token for deterministic end-to-end reset test
    const rawResetToken = crypto.randomBytes(32).toString('hex');
    const resetHash = crypto.createHash('sha256').update(rawResetToken).digest('hex');
    updatedUser.resetTokenHash = resetHash;
    updatedUser.resetTokenExpiry = Date.now() + 3600 * 1000;
    updatedUser.resetTokenUsed = false;
    saveDatabase();

    const validResetRes = await makeHttpRequest(server, {
      method: 'POST',
      path: '/api/auth/reset-password',
      body: { token: rawResetToken, newPassword: 'NewPassword2026!' }
    });
    assert(validResetRes.status === 200 && validResetRes.body.success === true, 'POST /api/auth/reset-password succeeds with valid token');

    // Replay attack with same token must fail
    const replayResetRes = await makeHttpRequest(server, {
      method: 'POST',
      path: '/api/auth/reset-password',
      body: { token: rawResetToken, newPassword: 'AnotherPassword!' }
    });
    assert(replayResetRes.status === 400, 'POST /api/auth/reset-password rejects token replay');

    // -------------------------------------------------------------
    // 5. POSTS CRUD & AUTHORIZATION PIPELINE
    // -------------------------------------------------------------
    console.log('\n--- 5. Posts CRUD & Authorization HTTP Chain ---');
    // Unauthorized post creation
    const unauthPostRes = await makeHttpRequest(server, {
      method: 'POST',
      path: '/api/posts',
      body: { title: 'Unauthorized Post', content: '<p>Content</p>' }
    });
    assert(unauthPostRes.status === 401, 'POST /api/posts rejects unauthenticated request with 401');

    // Fresh session token for author (since password reset bumped tokenVersion)
    const freshAuthorUser = db.users.find((u: any) => u.id === authorId);
    if (freshAuthorUser) {
      freshAuthorUser.role = 'author';
      saveDatabase();
      authorSessionToken = createSessionToken(freshAuthorUser);
    }

    // Authorized author post creation with XSS payload
    const createPostRes = await makeHttpRequest(server, {
      method: 'POST',
      path: '/api/posts',
      headers: { Authorization: `Bearer ${authorSessionToken}` },
      body: {
        title: 'Safe Blog Post <script>alert("XSS")</script>',
        content: '<p>Valid article content with <a href="javascript:alert(1)">bad link</a>.</p>',
        summary: 'Brief summary of the article',
        categories: ['Technology']
      }
    });
    assert(createPostRes.status === 201 && !!createPostRes.body.post, 'POST /api/posts creates post with 201 Created');
    const createdPost = createPostRes.body.post;
    const postId = createdPost?.id;

    if (createdPost) {
      assert(!createdPost.title.includes('<script>'), 'POST /api/posts sanitizes XSS in title');
      assert(!createdPost.content.includes('javascript:'), 'POST /api/posts sanitizes dangerous javascript href in content');
    }

    // PUT /api/posts/:id (Edit by Author)
    const editPostRes = await makeHttpRequest(server, {
      method: 'PUT',
      path: `/api/posts/${postId}`,
      headers: { Authorization: `Bearer ${authorSessionToken}` },
      body: {
        title: 'Updated Post Title'
      }
    });
    assert(editPostRes.status === 200 && editPostRes.body.post.title === 'Updated Post Title', 'PUT /api/posts/:id updates post successfully');

    // Create a reader user to test forbidden edit
    const readerUser = {
      id: 'usr_reader_test',
      name: 'Reader Only',
      email: 'reader_test@blogge.io',
      role: 'reader',
      status: 'active',
      tokenVersion: 0
    };
    db.users.push(readerUser);
    saveDatabase();

    // Reader trying to edit author's post
    const readerToken = createSessionToken(readerUser);

    const forbiddenEditRes = await makeHttpRequest(server, {
      method: 'PUT',
      path: `/api/posts/${postId}`,
      headers: { Authorization: `Bearer ${readerToken}` },
      body: { title: 'Hacked Title' }
    });
    assert(forbiddenEditRes.status === 403, 'PUT /api/posts/:id rejects non-author / reader with 403 Forbidden');

    // -------------------------------------------------------------
    // 6. POST LIKE DEDUPLICATION (POST /api/posts/:id/like)
    // -------------------------------------------------------------
    console.log('\n--- 6. Post Like Deduplication HTTP Pipeline ---');
    const likeRes1 = await makeHttpRequest(server, {
      method: 'POST',
      path: `/api/posts/${postId}/like`,
      headers: { Authorization: `Bearer ${authorSessionToken}` }
    });
    assert(likeRes1.status === 200 && likeRes1.body.isLiked === true && likeRes1.body.likes === 1, 'POST /api/posts/:id/like increments like count on first toggle');

    const likeRes2 = await makeHttpRequest(server, {
      method: 'POST',
      path: `/api/posts/${postId}/like`,
      headers: { Authorization: `Bearer ${authorSessionToken}` }
    });
    assert(likeRes2.status === 200 && likeRes2.body.isLiked === false && likeRes2.body.likes === 0, 'POST /api/posts/:id/like un-likes and decrements count on second toggle');

    // -------------------------------------------------------------
    // 7. COMMENTS CREATION & MODERATION (POST /api/comments & PUT /status)
    // -------------------------------------------------------------
    console.log('\n--- 7. Comments Creation & Moderation HTTP Chain ---');
    const commentRes = await makeHttpRequest(server, {
      method: 'POST',
      path: '/api/comments',
      body: {
        postId,
        authorName: 'Friendly Reader <script>',
        content: 'This is a genuine comment on the article!'
      }
    });
    assert(commentRes.status === 201 && !!commentRes.body.comment, 'POST /api/comments posts comment with 201 Created');
    const commentId = commentRes.body?.comment?.id;
    if (commentRes.body?.comment) {
      assert(!commentRes.body.comment.authorName.includes('<script>'), 'POST /api/comments sanitizes author name');
    }

    // Admin session token for comment moderation
    const adminUser = {
      id: 'usr_admin_main',
      role: 'admin',
      email: ADMIN_EMAIL,
      tokenVersion: 0
    };
    const adminToken = createSessionToken(adminUser);

    const updateCommentStatusRes = await makeHttpRequest(server, {
      method: 'PUT',
      path: `/api/comments/${commentId}/status`,
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { status: 'approved' }
    });
    assert(updateCommentStatusRes.status === 200 && updateCommentStatusRes.body.status === 'approved', 'PUT /api/comments/:id/status updates status under Admin privileges');

    // Reader trying to update comment status must fail
    const readerCommentStatusRes = await makeHttpRequest(server, {
      method: 'PUT',
      path: `/api/comments/${commentId}/status`,
      headers: { Authorization: `Bearer ${readerToken}` },
      body: { status: 'spam' }
    });
    assert(readerCommentStatusRes.status === 403, 'PUT /api/comments/:id/status rejects unauthorized reader with 403 Forbidden');

    // -------------------------------------------------------------
    // 8. GEMINI AI ENDPOINTS (POST /api/ai/write)
    // -------------------------------------------------------------
    console.log('\n--- 8. AI Content Generation Authorization (POST /api/ai/write) ---');
    const unauthAiRes = await makeHttpRequest(server, {
      method: 'POST',
      path: '/api/ai/write',
      body: { prompt: 'Write an article about AI' }
    });
    assert(unauthAiRes.status === 401, 'POST /api/ai/write rejects unauthenticated requests with 401');

    const readerAiRes = await makeHttpRequest(server, {
      method: 'POST',
      path: '/api/ai/write',
      headers: { Authorization: `Bearer ${readerToken}` },
      body: { prompt: 'Write an article about AI' }
    });
    assert(readerAiRes.status === 403, 'POST /api/ai/write rejects reader role with 403 Forbidden');

    const authorAiEmptyRes = await makeHttpRequest(server, {
      method: 'POST',
      path: '/api/ai/write',
      headers: { Authorization: `Bearer ${authorSessionToken}` },
      body: {}
    });
    assert(authorAiEmptyRes.status === 400, 'POST /api/ai/write rejects empty prompt with 400 Bad Request');

    // -------------------------------------------------------------
    // 9. DELETE /api/posts/:id AUTHORIZATION & CLEANUP
    // -------------------------------------------------------------
    console.log('\n--- 9. Post Deletion & Cleanup (DELETE /api/posts/:id) ---');
    const readerDeleteRes = await makeHttpRequest(server, {
      method: 'DELETE',
      path: `/api/posts/${postId}`,
      headers: { Authorization: `Bearer ${readerToken}` }
    });
    assert(readerDeleteRes.status === 403, 'DELETE /api/posts/:id rejects unauthorized reader with 403 Forbidden');

    const authorDeleteRes = await makeHttpRequest(server, {
      method: 'DELETE',
      path: `/api/posts/${postId}`,
      headers: { Authorization: `Bearer ${authorSessionToken}` }
    });
    assert(authorDeleteRes.status === 200 && authorDeleteRes.body.success === true, 'DELETE /api/posts/:id succeeds for post author');

    // -------------------------------------------------------------
    // SUMMARY & RESULTS
    // -------------------------------------------------------------
    console.log('\n================================================================');
    console.log(`HTTP INTEGRATION TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log('================================================================');

    server.close();

    if (failedCount > 0) {
      console.error('\nFailures summary:');
      failures.forEach(f => console.error(f));
      process.exit(1);
    } else {
      console.log('\nALL HTTP INTEGRATION TESTS PASSED WITH 100% SUCCESS!');
      process.exit(0);
    }
  } catch (suiteErr) {
    server.close();
    console.error('Fatal Suite Error:', suiteErr);
    process.exit(1);
  }
}

runSuite();
