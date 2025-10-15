import { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";

const PORT = process.env.PORT || 8080;
const wss = new WebSocketServer({ port: PORT, host: '0.0.0.0' });

console.log(`WebSocket server started on port ${PORT}`);

// --- Anomaly Detection Rules ---
const AMOUNT_THRESHOLD = 50000;
const HIGH_RISK_COUNTRIES = [
  "Nigeria",
  "Russia",
  "Turkey",
  "United Arab Emirates",
  "Pakistan",
];
const OFF_HOURS_START = 0; // Midnight
const OFF_HOURS_END = 6; // 6 AM
// --- NEW RULE PARAMETERS ---
const VELOCITY_THRESHOLD_COUNT = 3; // 3 or more transactions
const VELOCITY_THRESHOLD_SECONDS = 30; // within 30 seconds

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "China",
  "India",
  "Brazil",
  "Russia",
  "South Africa",
  "Nigeria",
  "Mexico",
  "Argentina",
  "South Korea",
  "Singapore",
  "Hong Kong",
  "Switzerland",
  "United Arab Emirates",
  "Netherlands",
  "Italy",
  "Spain",
  "Saudi Arabia",
  "Turkey",
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
    const randomOffHour =
      Math.floor(Math.random() * (OFF_HOURS_END - OFF_HOURS_START)) +
      OFF_HOURS_START;
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

  // --- NEW LOGIC: UPDATE AND CHECK TRANSACTION HISTORY ---
  // 1. Filter out old transactions from our history (older than our time window).
  transactionHistory = transactionHistory.filter(
    (tx) => (now - tx.timestamp) / 1000 < VELOCITY_THRESHOLD_SECONDS
  );

  // 2. Check for recent, similar transactions.
  const similarTransactions = transactionHistory.filter(
    (tx) =>
      tx.sourceCountry === transaction.sourceCountry &&
      tx.destCountry === transaction.destCountry
  );

  // 3. Add the current transaction to the history for future checks.
  transactionHistory.push({
    sourceCountry: transaction.sourceCountry,
    destCountry: transaction.destCountry,
    timestamp: transaction.timestamp,
  });

  // Keep the history array from growing indefinitely.
  if (transactionHistory.length > 200) {
    transactionHistory.shift();
  }

  // Rule 1: High Amount
  if (transaction.amount > AMOUNT_THRESHOLD) {
    reasons.push("Exceeds amount threshold");
  }

  // Rule 2: High-Risk Countries
  if (
    HIGH_RISK_COUNTRIES.includes(transaction.sourceCountry) ||
    HIGH_RISK_COUNTRIES.includes(transaction.destCountry)
  ) {
    reasons.push("Involves a high-risk country");
  }

  // Rule 3: Unusual Transaction Time
  const transactionHour = new Date(transaction.timestamp).getHours();
  if (transactionHour >= OFF_HOURS_START && transactionHour < OFF_HOURS_END) {
    reasons.push("Unusual transaction time");
  }

  // Rule 4: Rapid Repeated Transactions

  if (similarTransactions.length + 1 >= VELOCITY_THRESHOLD_COUNT) {
    reasons.push("Rapid repeated transactions");
  }

  return {
    ...transaction,
    isAnomaly: reasons.length > 0,
    reason: reasons.join("; "),
  };
}

wss.on("connection", (ws) => {
  console.log("Client connected");

  transactionHistory = [];

  const intervalId = setInterval(() => {
    const transaction = generateTransaction();
    const processedTransaction = detectAnomalies(transaction);
    ws.send(JSON.stringify(processedTransaction));
  }, 2000); // Send a new transaction every 2 seconds

  ws.on("close", () => {
    console.log("Client disconnected");
    clearInterval(intervalId);
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
    clearInterval(intervalId);
  });
});

