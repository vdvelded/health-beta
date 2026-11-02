import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { after, before, describe, test } from 'node:test';
import { createApp } from '../src/app.js';

let server;
let baseUrl;

before(async () => {
  server = createServer(createApp());
  await new Promise((resolve) => server.listen(0, resolve));
  baseUrl = `http://localhost:${server.address().port}`;
});

after(() => server.close());

function login(username, password) {
  return fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ username, password }),
    redirect: 'manual',
  });
}

async function sessionCookie(username, password) {
  const res = await login(username, password);
  return res.headers.get('set-cookie').split(';')[0];
}

describe('login page', () => {
  test('shows a sign-in form', async () => {
    const res = await fetch(`${baseUrl}/login`);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /<form method="post" action="\/login">/);
    assert.match(html, /name="username"/);
    assert.match(html, /name="password" type="password"/);
  });

  test('rejects a wrong password and keeps the username', async () => {
    const res = await login('alice', 'wrong');
    assert.equal(res.status, 401);
    const html = await res.text();
    assert.match(html, /Invalid username or password/);
    assert.match(html, /value="alice"/);
    assert.equal(res.headers.get('set-cookie'), null);
  });

  test('rejects an unknown user', async () => {
    const res = await login('mallory', 'alice123');
    assert.equal(res.status, 401);
  });

  test('signs in with valid credentials and redirects to issues', async () => {
    const res = await login('alice', 'alice123');
    assert.equal(res.status, 303);
    assert.equal(res.headers.get('location'), '/issues');
    assert.match(res.headers.get('set-cookie'), /^session=[0-9a-f]+; HttpOnly/);
  });
});

describe('open quality issues page', () => {
  test('redirects to login when not signed in', async () => {
    const res = await fetch(`${baseUrl}/issues`, { redirect: 'manual' });
    assert.equal(res.status, 303);
    assert.equal(res.headers.get('location'), '/login');
  });

  test('shows only the signed-in user\'s open issues', async () => {
    const cookie = await sessionCookie('alice', 'alice123');
    const res = await fetch(`${baseUrl}/issues`, { headers: { cookie } });
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /My open quality issues \(2\)/);
    assert.match(html, /QI-101/);
    assert.match(html, /QI-102/);
    assert.doesNotMatch(html, /QI-103/, 'closed issue is hidden');
    assert.doesNotMatch(html, /QI-201/, 'another user\'s issue is hidden');
  });

  test('sign out ends the session', async () => {
    const cookie = await sessionCookie('bob', 'bob123');
    const logout = await fetch(`${baseUrl}/logout`, { method: 'POST', headers: { cookie }, redirect: 'manual' });
    assert.equal(logout.headers.get('location'), '/login');
    const res = await fetch(`${baseUrl}/issues`, { headers: { cookie }, redirect: 'manual' });
    assert.equal(res.status, 303);
  });
});

describe('home', () => {
  test('sends signed-in users to their issues', async () => {
    const cookie = await sessionCookie('bob', 'bob123');
    const res = await fetch(`${baseUrl}/`, { headers: { cookie }, redirect: 'manual' });
    assert.equal(res.headers.get('location'), '/issues');
  });
});
