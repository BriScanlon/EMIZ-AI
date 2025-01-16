// packages
import net from 'node:net';
import mongoose from 'mongoose';

// helpers
import log from './helpers/logger.js';

// enable environment variables
import dotenv from 'dotenv';
dotenv.config();

const {
  MONGODB_ROOT_USER,
  MONGODB_ROOT_PASSWORD,
  MONGODB_USER,
  MONGODB_PASSWORD,
  MONGODB_DATABASE,
  DATABASE_HOST,
  DATABASE_PORT,
} = process.env;

const mongoUri = `mongodb://${MONGODB_ROOT_USER}:${MONGODB_ROOT_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}`;
const redactedMongoUri = `mongodb://${MONGODB_ROOT_USER}:******@${DATABASE_HOST}:${DATABASE_PORT}`;

async function initialise() {
  log(0, `Attempting to connect to ${redactedMongoUri}`)

  // Wait for mongodb to appear to be working 
  // We will try 5 times
  await new Promise(async(resolve, reject) => {
    let attempt = 1;
    const attemptConnection = () => {
      const socket = new net.Socket();

      const onError = async () => {
        log(1, `Connection attempt number ${attempt} was unsuccessful`)
        
        attempt += 1;
        socket.destroy();

        if(attempt === 6) {
          log(2, 'Unable to reach database after 5 attempts, exiting...');
          reject();
        }

        await new Promise((res) => setTimeout(()=>res(), 30000))
        attemptConnection();
      };
    
      socket.setTimeout(5000);
      socket.once('error', onError);
      socket.once('timeout', onError);

      socket.connect(DATABASE_PORT, DATABASE_HOST, () => {
        socket.end();
        resolve();
      });
    }
    
    attemptConnection();
  })

  // Create the database connection
  mongoose.set('strictQuery', false);
  mongoose.connect(mongoUri);

  // CONNECTION EVENTS
  // When successfully connected
  mongoose.connection.on('connected', async () => {
    try {
      log(0, 'Mongoose connection open to ' + redactedMongoUri);
      const { users } = await mongoose.connection.db.admin().command({ usersInfo: MONGODB_USER });

      if (users.length === 0) {
        log(0, 'Creating new database user ' + MONGODB_USER);
        await mongoose.connection.db.admin().command({
          createUser: MONGODB_USER,
          pwd: MONGODB_PASSWORD,
          roles: [{ db: MONGODB_DATABASE, role: 'dbOwner' }],
        });
      }

      await mongoose.disconnect();
    } catch (e) {
        log(2, 'Mongoose setup error: ' + err);
    }

    log(0, 'Mongoose connection disconnected through app termination');
    process.exit(0);
  });

  // If the connection throws an error
  mongoose.connection.on('error', (err) => {
    log(2, 'Mongoose connection error: ' + err);
  });
}

initialise();
