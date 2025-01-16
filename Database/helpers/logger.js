// enable environment variables
import dotenv from 'dotenv';
dotenv.config();

const { LOG_LEVEL } = process.env;

const logTypes = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
const logColors = ['36m', '33m', '31m', '32m'];

const logLevel = parseInt(LOG_LEVEL || '0', 10);

export default function log(type, message) {
  if (type < logLevel) return;

  const now = Date.now();
  const data = Intl.DateTimeFormat(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const time = Intl.DateTimeFormat(undefined, { timeStyle: 'medium', hour12: false }).format(now);

  console.log(`[\x1b[${logColors[type]}${logTypes[type]}${'\x1b[0m'}] ${data} ${time} - ${message}\x1b[0m`);
}
