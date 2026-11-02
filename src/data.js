import { hashPassword } from './auth.js';

// Seed data so the app runs without a database. Replace with a real store.
export function createSeedData() {
  const users = new Map([
    ['alice', { username: 'alice', name: 'Alice Jansen', passwordHash: hashPassword('alice123') }],
    ['bob', { username: 'bob', name: 'Bob de Vries', passwordHash: hashPassword('bob123') }],
  ]);

  const issues = [
    { id: 'QI-101', title: 'Hand hygiene compliance below target on ward 3', owner: 'alice', status: 'open', priority: 'high', dueDate: '2026-11-15' },
    { id: 'QI-102', title: 'Medication reconciliation missing at discharge', owner: 'alice', status: 'open', priority: 'medium', dueDate: '2026-11-30' },
    { id: 'QI-103', title: 'Fall risk assessment not documented', owner: 'alice', status: 'closed', priority: 'low', dueDate: '2026-10-01' },
    { id: 'QI-201', title: 'Pressure ulcer incidence increase', owner: 'bob', status: 'open', priority: 'high', dueDate: '2026-11-10' },
  ];

  return {
    findUser(username) {
      return users.get(username);
    },
    openIssuesFor(username) {
      return issues.filter((issue) => issue.owner === username && issue.status === 'open');
    },
  };
}
