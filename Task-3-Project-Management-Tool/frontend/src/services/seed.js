function _genId() {
  return crypto.randomUUID();
}

const demoUsers = [
  { _id: _genId(), name: 'kiran', email: 'kiran@demo.com', password: '123456', avatar: '', role: 'user', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { _id: _genId(), name: 'rahul', email: 'rahul@demo.com', password: '123456', avatar: '', role: 'user', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { _id: _genId(), name: 'sonu', email: 'sonu@demo.com', password: '123456', avatar: '', role: 'user', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export function seedUsers() {
  const existing = JSON.parse(localStorage.getItem('pf_users') || '[]');
  const existingEmails = new Set(existing.map(u => u.email));

  for (const u of demoUsers) {
    if (!existingEmails.has(u.email)) {
      existing.push(u);
      existingEmails.add(u.email);
    }
  }

  localStorage.setItem('pf_users', JSON.stringify(existing));
  console.log('Seeded users:', demoUsers.map(u => u.name).join(', '));
  return existing;
}
