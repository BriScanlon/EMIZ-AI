# Bloc - Mongo Initialise

In order to connect this you must add these lines to your mongodb docker compose

environment
```bash
- MONGO_INITDB_DATABASE=$MONGODB_DATABASE
```

volumes
```bash
- ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
```