// simulator.js
// This script simulates the generation of financial transaction data.

const { faker } = require("@faker-js/faker");

// A list of countries to use in the simulation.
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

const HIGH_RISK_COUNTRIES = [
  "Nigeria",
  "Russia",
  "Turkey",
  "United Arab Emirates",
  "Pakistan",
];

function createRandomTransaction() {
  const sourceCountry = faker.helpers.arrayElement(COUNTRIES);
  const destCountry = faker.helpers.arrayElement(
    COUNTRIES.filter((c) => c !== sourceCountry)
  );

  const isAnomalousAmount = Math.random() < 0.05; // 5% chance of a large amount
  const amount = isAnomalousAmount
    ? faker.finance.amount({ min: 75000, max: 200000, dec: 2 })
    : faker.finance.amount({ min: 500, max: 20000, dec: 2 });

  return {
    transactionId: faker.string.uuid(),
    sourceAccount: faker.finance.accountNumber(10),
    destAccount: faker.finance.accountNumber(10),
    sourceCountry: sourceCountry,
    destCountry: destCountry,
    amount: parseFloat(amount),
    currency: "USD",
    timestamp: new Date().toISOString(),
  };
}

function startSimulation() {
  setInterval(() => {
    const transaction = createRandomTransaction();

    console.log(JSON.stringify(transaction));
  }, 1000);
}

startSimulation();
