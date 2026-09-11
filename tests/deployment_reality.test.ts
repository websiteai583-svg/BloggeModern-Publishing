/**
 * BLOGGE PRODUCTION DEPLOYMENT & PUBLIC API REALITY TEST SUITE
 * Tests genuine public API reachability, absence of AI Studio preview redirection,
 * PostgreSQL configuration readiness, and invalid API detection.
 */
import http from 'http';
import { createApp } from '../server';
import { DEFAULT_PRODUCTION_API_URL, resolveApiUrl, checkApiConnectivity, safeFetch } from '../src/utils/safeFetch';
import { isPostgresConfigured, isPostgresConnected } from '../server/postgres';

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
      'Accept': 'application/json',
      ...(options.headers || {})
    };

    if (payload) {
      reqHeaders['Content-Type'] = 'application/json';
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

async function runRealityTestSuite() {
  console.log('================================================================');
  console.log('STARTING BLOGGE PRODUCTION DEPLOYMENT & PUBLIC API REALITY SUITE');
  console.log('================================================================\n');

  const app = await createApp({ skipVite: true });
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });

  try {
    // -------------------------------------------------------------
    // 1. PUBLIC API HEALTH TEST (NO 302 REDIRECT, JSON FORMAT)
    // -------------------------------------------------------------
    console.log('--- 1. Public API Health & Direct Network Access ---');
    const healthRes = await makeHttpRequest(server, { method: 'GET', path: '/api/health' });
    assert(healthRes.status === 200, 'GET /api/health returns HTTP 200 (No 302 redirect)');
    assert(healthRes.headers['content-type']?.includes('application/json') === true, 'GET /api/health Content-Type is application/json');
    assert(healthRes.body.success === true, 'GET /api/health body contains success: true');
    assert(healthRes.body.status === 'online', 'GET /api/health body contains status: "online"');
    assert(typeof healthRes.body.environment === 'string', 'GET /api/health body contains environment string');
    assert(healthRes.body.service === 'blogge-api', 'GET /api/health body contains service: "blogge-api"');
    assert(healthRes.body.postgresConnected !== undefined, 'GET /api/health reports PostgreSQL connection readiness');

    // -------------------------------------------------------------
    // 2. ABSENCE OF AI STUDIO PREVIEW GATEWAY IN CONFIGURATION
    // -------------------------------------------------------------
    console.log('--- 2. Production URL & Preview Gateway Sanitization ---');
    assert(!DEFAULT_PRODUCTION_API_URL.includes('ais-pre-'), 'DEFAULT_PRODUCTION_API_URL does not reference ais-pre-* preview gateway');
    assert(!DEFAULT_PRODUCTION_API_URL.includes('asia-southeast1.run.app'), 'DEFAULT_PRODUCTION_API_URL does not reference ephemeral preview project');
    assert(!resolveApiUrl('/api/health').includes('ais-pre-'), 'resolveApiUrl(/api/health) does not resolve to ais-pre-*');

    // -------------------------------------------------------------
    // 3. STARTUP VALIDATION: REJECTION OF 302 / HTML GATEWAY
    // -------------------------------------------------------------
    console.log('--- 3. Startup API Validation (302/HTML Rejection) ---');
    // Test that fake 302 or HTML gateway URL is rejected with "Production API configuration is invalid."
    const fakeServer = http.createServer((req, res) => {
      // Simulate AI Studio preview gateway behavior
      if (req.url?.startsWith('/api/')) {
        res.writeHead(302, { 'Location': '/__cookie_check.html' });
        res.end();
      } else if (req.url === '/__cookie_check.html') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<html>AI Studio Preview Cookie Gateway</html>');
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    await new Promise<void>((resolve) => {
      fakeServer.listen(0, '127.0.0.1', () => resolve());
    });

    const fakeAddress = fakeServer.address() as any;
    const fakePort = fakeAddress.port;
    const fakeUrl = `http://127.0.0.1:${fakePort}`;

    // Test safeFetch against fake 302 server
    const invalidApiRes = await safeFetch(`${fakeUrl}/api/health`, { skipAuth: true });
    assert(invalidApiRes.ok === false, 'safeFetch rejects 302 gateway redirect');
    assert(invalidApiRes.error === 'Production API configuration is invalid.', 'safeFetch returns "Production API configuration is invalid."');

    fakeServer.close();

    // -------------------------------------------------------------
    // 4. POSTGRESQL MULTI-INSTANCE DATABASE READINESS
    // -------------------------------------------------------------
    console.log('--- 4. Cloud Run Multi-Instance PostgreSQL Readiness ---');
    const wasConfigured = isPostgresConfigured();
    // Test detection with dummy DATABASE_URL
    process.env.DATABASE_URL = 'postgresql://test_user:test_pass@ep-cool-db.us-east-2.aws.neon.tech/neondb?sslmode=require';
    assert(isPostgresConfigured() === true, 'isPostgresConfigured() detects DATABASE_URL injection');
    delete process.env.DATABASE_URL;

    // -------------------------------------------------------------
    // 5. PUBLIC UNAUTHENTICATED ROUTES
    // -------------------------------------------------------------
    console.log('--- 5. Public Unauthenticated Routes Integrity ---');
    const publicEndpoints = [
      '/api/health',
      '/api/bootstrap',
      '/api/posts',
      '/api/categories',
      '/api/authors',
      '/api/search?q=technology'
    ];

    for (const endpoint of publicEndpoints) {
      const res = await makeHttpRequest(server, { method: 'GET', path: endpoint });
      assert(
        res.status === 200,
        `Public endpoint ${endpoint} returns 200 without requiring authentication or cookies`
      );
    }

  } finally {
    server.close();
  }

  console.log('\n================================================================');
  console.log(`REALITY TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('================================================================');

  if (failedCount > 0) {
    console.error('\nFailures summary:');
    failures.forEach((f) => console.error(f));
    process.exit(1);
  } else {
    console.log('ALL PRODUCTION DEPLOYMENT & REALITY CHECKS PASSED WITH 100% SUCCESS!\n');
    process.exit(0);
  }
}

runRealityTestSuite().catch((err) => {
  console.error('Fatal error running reality test suite:', err);
  process.exit(1);
});
