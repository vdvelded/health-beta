import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const expected = Buffer.from(hash, 'hex');
  const actual = scryptSync(password, salt, 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

// In-memory sessions: session id -> username.
export function createSessionStore() {
  const sessions = new Map();
  return {
    create(username) {
      const id = randomBytes(32).toString('hex');
      sessions.set(id, username);
      return id;
    },
    get(id) {
      return id ? sessions.get(id) : undefined;
    },
    destroy(id) {
      sessions.delete(id);
    },
  };
}
