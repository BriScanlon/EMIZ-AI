const { MONGODB_USER, MONGODB_PASSWORD, MONGODB_DATABASE } = process.env;

db.createUser({
  user: MONGODB_USER,
  pwd: MONGODB_PASSWORD,
  roles: [
    {
      role: 'dbOwner',
      db: MONGODB_DATABASE,
    },
  ],
});
