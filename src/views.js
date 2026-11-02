export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

const styles = `
  body { font-family: system-ui, sans-serif; margin: 0; background: #f5f7fa; color: #1f2933; }
  header { background: #0b6e4f; color: #fff; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
  header h1 { margin: 0; font-size: 1.25rem; }
  header form { margin: 0; }
  main { max-width: 56rem; margin: 2rem auto; padding: 0 1rem; }
  .card { background: #fff; border-radius: 8px; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,.1); }
  .login { max-width: 22rem; margin: 4rem auto; }
  label { display: block; margin-top: 1rem; font-weight: 600; }
  input { width: 100%; padding: .5rem; margin-top: .25rem; box-sizing: border-box; }
  button { margin-top: 1.5rem; padding: .5rem 1rem; background: #0b6e4f; color: #fff; border: 0; border-radius: 4px; cursor: pointer; }
  header button { margin: 0; background: #fff; color: #0b6e4f; }
  .error { color: #b00020; margin-top: 1rem; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: .5rem; border-bottom: 1px solid #e4e7eb; }
  .priority-high { color: #b00020; font-weight: 600; }
`;

function layout(title, body, user) {
  const signOut = user
    ? `<form method="post" action="/logout"><span>${escapeHtml(user.name)}</span> <button type="submit">Sign out</button></form>`
    : '';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} | Health Quality</title>
<style>${styles}</style>
</head>
<body>
<header><h1>Health Quality</h1>${signOut}</header>
<main>${body}</main>
</body>
</html>`;
}

export function loginPage({ error, username = '' } = {}) {
  const errorHtml = error ? `<p class="error" role="alert">${escapeHtml(error)}</p>` : '';
  return layout(
    'Sign in',
    `<div class="card login">
  <h2>Sign in</h2>
  <form method="post" action="/login">
    <label for="username">Username</label>
    <input id="username" name="username" autocomplete="username" required value="${escapeHtml(username)}">
    <label for="password">Password</label>
    <input id="password" name="password" type="password" autocomplete="current-password" required>
    ${errorHtml}
    <button type="submit">Sign in</button>
  </form>
</div>`,
  );
}

export function issuesPage(user, issues) {
  const rows = issues
    .map(
      (issue) => `<tr>
      <td>${escapeHtml(issue.id)}</td>
      <td>${escapeHtml(issue.title)}</td>
      <td class="priority-${escapeHtml(issue.priority)}">${escapeHtml(issue.priority)}</td>
      <td>${escapeHtml(issue.dueDate)}</td>
    </tr>`,
    )
    .join('');
  const content = issues.length
    ? `<table>
    <thead><tr><th>ID</th><th>Issue</th><th>Priority</th><th>Due</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`
    : '<p>You have no open quality issues.</p>';
  return layout(
    'My open quality issues',
    `<div class="card">
  <h2>My open quality issues (${issues.length})</h2>
  ${content}
</div>`,
    user,
  );
}
