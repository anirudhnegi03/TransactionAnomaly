# Real-Time Transaction Anomaly Detector

A full-stack web application that simulates a live stream of international financial transactions and identifies suspicious activities in real-time.  
This project demonstrates the use of a modern web stack (**React**,  **Node.js**) to build a responsive, real-time monitoring dashboard..

<img width="1918" height="990" alt="image" src="https://github.com/user-attachments/assets/d383b612-6602-4d1c-8569-0ffac83640d4" />

---

## Key Features

### Live Data Stream
- A **Node.js** backend simulates a continuous, high-frequency stream of transaction data, pushed to the frontend using a persistent **WebSocket** connection.

### Real-Time UI Updates
- The **React** frontend dynamically renders new transactions and alerts as they occur, providing a true real-time monitoring experience without page refreshes.

### Multi-Rule Anomaly Detection
The system flags transactions based on a combination of **stateless** and **stateful** rules:

- **High Value Transactions:** Flags transactions exceeding a predefined amount threshold (e.g., > $50,000).  
- **High-Risk Geographies:** Flags transactions involving countries designated as high-risk.  
- **Unusual Hours:** Flags transactions occurring during off-hours (e.g., between midnight and 6 AM), a common indicator of fraud.  
- **Transaction Velocity:** A stateful check that flags rapid, repeated transactions between the same two countries within a short time window (e.g., 3+ times in 30 seconds).

---

## Tech Stack

### Frontend
- **React:** For building the declarative, component-based user interface.  
- **Vite:** A next-generation frontend tool that provides an extremely fast development server and optimized build process.  
- **Tailwind CSS:** A utility-first CSS framework for creating the responsive and clean design.  
- **WebSockets API:** Native browser API used to receive the real-time data stream from the server.

### Backend
- **Node.js:** As the asynchronous JavaScript runtime for the server.  
- **ws library:** A fast and reliable WebSocket library for Node.js, used to manage the real-time communication channel with clients.  
- **uuid library:** For generating unique transaction IDs in the simulation.

---

## Getting Started

To get a local copy up and running, please follow these steps.

---

## Installation & Launch

You will need to run the **backend** and **frontend** in two separate terminal windows.

### Terminal 1: Start the Backend Server

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Install the necessary dependencies
npm install

# 3. Start the server
node server.js

# The terminal should log:
# "WebSocket server started on port 8080"
```

Leave this terminal running.

---

### Terminal 2: Start the Frontend Application

```bash
# 1. Open a new terminal and navigate to the frontend directory
cd frontend

# 2. Install the necessary dependencies
npm install

# 3. Start the Vite development server
npm run dev

# Your default browser should automatically open to:
# http://localhost:5173
```

---

You should now see the **Transaction Anomaly Detector** dashboard in your browser, with the status **"Connected"** and data streaming in from the backend.
