import React, { useState, useEffect, useRef } from "react";

const WEBSOCKET_URL = "ws://localhost:8080";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const logEndRef = useRef(null);
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const transactionLogRef = useRef(null);

  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket(WEBSOCKET_URL);

      ws.onopen = () => {
        console.log("Connected to WebSocket server");
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        setTransactions((prev) => [message, ...prev].slice(0, 100));
        if (message.isAnomaly) {
          setAlerts((prev) => [message, ...prev].slice(0, 50));
        }
      };

      ws.onclose = () => {
        console.log("Disconnected. Reconnecting...");
        setIsConnected(false);
        setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        ws.close();
      };

      return () => {
        ws.close();
      };
    };

    connectWebSocket();
  }, []);

  // Smooth autoscroll only if user hasn't manually scrolled
  useEffect(() => {
    if (!userHasScrolled && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "auto", block: "end" });
    }
  }, [transactions]);

  const handleScroll = () => {
    const logEl = transactionLogRef.current;
    if (logEl) {
      const isAtBottom =
        logEl.scrollHeight - logEl.scrollTop <= logEl.clientHeight + 50;
      setUserHasScrolled(!isAtBottom);
    }
  };

  return (
    <div className="bg-black text-white h-screen font-sans flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-600 p-4 flex justify-between items-center shrink-0">
        <h1 className="text-xl font-bold">Transaction Anomaly Detector</h1>
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-400" : "bg-gray-600"
            }`}
          ></div>
          <span className="text-sm">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
        {/* Alerts Panel */}
        <div className="border border-gray-600 rounded-lg flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-600">
            <h2 className="text-xl font-semibold">Alerts</h2>
          </div>
          <div className="overflow-y-auto flex-grow p-4 space-y-3 pr-2">
            {alerts.length === 0 && (
              <p className="text-gray-400">No anomalies detected.</p>
            )}
            {alerts.map((alert) => (
              <div
                key={alert.transactionId}
                className="bg-red-900/20 border border-red-700 p-3 rounded-md"
              >
                <p>
                  <strong>ID:</strong> {alert.transactionId.substring(0, 8)}...
                </p>
                <p>
                  <strong>Amount:</strong> $
                  {alert.amount.toLocaleString("en-US")}
                </p>
                <p>
                  <strong>Route:</strong> {alert.sourceCountry} →{" "}
                  {alert.destCountry}
                </p>
                <p>
                  <strong>Reason:</strong> {alert.reason}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction Feed Panel */}
        <div className="lg:col-span-2 border border-gray-600 rounded-lg flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-600">
            <h2 className="text-xl font-semibold">Live Transaction Feed</h2>
          </div>
          <div
            ref={transactionLogRef}
            onScroll={handleScroll}
            className="overflow-y-auto flex-grow font-mono text-sm p-4 space-y-1 pr-2"
          >
            {transactions.map((tx) => (
              <div
                key={tx.transactionId}
                className={`flex justify-between ${
                  tx.isAnomaly ? "font-bold text-red-400" : ""
                }`}
              >
                <span>{new Date(tx.timestamp).toLocaleTimeString()}</span>
                <span>
                  {tx.sourceCountry} → {tx.destCountry}
                </span>
                <span>${tx.amount.toLocaleString("en-US")}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
