import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import http from 'http';

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Server is alive and running.');
});

const wss = new WebSocketServer({ server });

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

const AMOUNT_THRESHOLD = 50000;
const HIGH_RISK_COUNTRIES = [
  "Nigeria", "Russia", "Turkey", "United Arab Emirates", "Pakistan",
];
const OFF_HOURS_START = 0;
const OFF_HOURS_END = 6;
const VELOCITY_THRESHOLD_COUNT = 3;
const VELOCITY_THRESHOLD_SECONDS = 30;

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Japan", "China", "India", "Brazil", "Russia", "South Africa", "Nigeria", "Mexico", "Argentina", "South Korea", "Singapore", "Hong Kong", "Switzerland", "United Arab Emirates", "Netherlands", "Italy", "Spain", "Saudi Arabia", "Turkey",
];

let transactionHistory = [];

function generateTransaction() {
  const sourceCountry = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
  let destCountry = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
  while (destCountry === sourceCountry) {
    destCountry = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
  }
  let timestamp = Date.now();
  if (Math.random() < 0.15) {
    const offHourDate = new Date();
    const randomOffHour = Math.floor(Math.random() * (OFF_HOURS_END - OFF_HOURS_START)) + OFF_HOURS_START;
    offHourDate.setHours(randomOffHour, Math.floor(Math.random() * 60));
    timestamp = offHourDate.getTime();
  }
  return {
    transactionId: uuidv4(),
    amount: Math.random() * 100000,
    sourceCountry,
    destCountry,
    timestamp: timestamp,
  };
}

function detectAnomalies(transaction) {
  const reasons = [];
  const now = Date.now();
  transactionHistory = transactionHistory.filter(tx => (now - tx.timestamp) / 1000 < VELOCITY_THRESHOLD_SECONDS);
  const similarTransactions = transactionHistory.filter(tx => tx.sourceCountry === transaction.sourceCountry && tx.destCountry === transaction.destCountry);
  transactionHistory.push({ sourceCountry: transaction.sourceCountry, destCountry: transaction.destCountry, timestamp: transaction.timestamp });
  if (transactionHistory.length > 200) { transactionHistory.shift(); }
  if (transaction.amount > AMOUNT_THRESHOLD) { reasons.push("Exceeds amount threshold"); }
  if (HIGH_RISK_COUNTRIES.includes(transaction.sourceCountry) || HIGH_RISK_COUNTRIES.includes(transaction.destCountry)) { reasons.push("Involves a high-risk country"); }
  const transactionHour = new Date(transaction.timestamp).getHours();
  if (transactionHour >= OFF_HOURS_START && transactionHour < OFF_HOURS_END) { reasons.push("Unusual transaction time"); }
  if (similarTransactions.length + 1 >= VELOCITY_THRESHOLD_COUNT) { reasons.push("Rapid repeated transactions"); }
  return { ...transaction, isAnomaly: reasons.length > 0, reason: reasons.join("; ") };
}

wss.on('connection', (ws) => {
  console.log('Client successfully connected!');
  transactionHistory = [];
  const intervalId = setInterval(() => {
    const transaction = generateTransaction();
    const processedTransaction = detectAnomalies(transaction);
    ws.send(JSON.stringify(processedTransaction));
  }, 2000);
  ws.on('close', () => {
    console.log('Client disconnected.');
    clearInterval(intervalId);
  });
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clearInterval(intervalId);
  });
});

