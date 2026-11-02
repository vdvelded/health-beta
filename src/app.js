import { createSessionStore, verifyPassword } from './auth.js';
import { createSeedData } from './data.js';
import { issuesPage, loginPage } from './views.js';

const SESSION_COOKIE = 'session';

function parseCookies(header = '') {
  const cookies = {};
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index > 0) cookies[part.slice(0, index).trim()] = decodeURIComponent(part.slice(index + 1).trim());
  }
  return cookies;
}

async function readForm(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 1e4) throw new Error('Request body too large');
  }
  return Object.fromEntries(new URLSearchParams(body));
}

function send(res, status, html, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8', ...headers });
  res.end(html);
}

function redirect(res, location, headers = {}) {
  res.writeHead(303, { Location: location, ...headers });
  res.end();
}

export function createApp({ data = createSeedData(), sessions = createSessionStore() } = {}) {
  return async function handle(req, res) {
    const { pathname } = new URL(req.url, 'http://localhost');
    const sessionId = parseCookies(req.headers.cookie)[SESSION_COOKIE];
    const username = sessions.get(sessionId);
    const user = username && data.findUser(username);

    try {
      if (req.method === 'GET' && pathname === '/') {
        return redirect(res, user ? '/issues' : '/login');
      }

      if (req.method === 'GET' && pathname === '/login') {
        if (user) return redirect(res, '/issues');
        return send(res, 200, loginPage());
      }

      if (req.method === 'POST' && pathname === '/login') {
        const form = await readForm(req);
        const candidate = data.findUser(form.username ?? '');
        if (!candidate || !verifyPassword(form.password ?? '', candidate.passwordHash)) {
          return send(res, 401, loginPage({ error: 'Invalid username or password.', username: form.username }));
        }
        const id = sessions.create(candidate.username);
        return redirect(res, '/issues', {
          'Set-Cookie': `${SESSION_COOKIE}=${id}; HttpOnly; SameSite=Lax; Path=/`,
        });
      }

      if (req.method === 'POST' && pathname === '/logout') {
        sessions.destroy(sessionId);
        return redirect(res, '/login', {
          'Set-Cookie': `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`,
        });
      }

      if (req.method === 'GET' && pathname === '/issues') {
        if (!user) return redirect(res, '/login');
        return send(res, 200, issuesPage(user, data.openIssuesFor(user.username)));
      }

      return send(res, 404, '<h1>Not found</h1>');
    } catch {
      return send(res, 400, '<h1>Bad request</h1>');
    }
  };
}
