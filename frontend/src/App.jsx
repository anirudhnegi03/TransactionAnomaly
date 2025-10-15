import React, { useState, useEffect, useRef } from "react";

const WEBSOCKET_URL = "wss://transactionanomalybackend.onrender.com";

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
      ws.onopen = () => setIsConnected(true);
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        setTransactions((prev) => [message, ...prev].slice(0, 100));
        if (message.isAnomaly)
          setAlerts((prev) => [message, ...prev].slice(0, 50));
      };
      ws.onerror = (error) => console.error("WebSocket error:", error);
      ws.onclose = () => {
        setIsConnected(false);
        
        console.log("WebSocket disconnected. Please refresh to reconnect.");
      };
      return () => ws.close();
    };
    connectWebSocket();
  }, []);

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
    <div className="bg-black text-white h-screen overflow-hidden font-sans flex flex-col">
      <header className="flex-shrink-0 border-b border-gray-700 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Transaction Anomaly Detector</h1>
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span className="text-sm">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </header>
      <main className="flex-grow p-4 grid grid-cols-1 lg-grid-cols-3 gap-4 overflow-hidden">
        <div className="border border-gray-700 rounded-lg p-4 flex flex-col overflow-hidden">
          <h2 className="flex-shrink-0 text-lg font-semibold mb-3 border-b border-gray-700 pb-2">
            High-Priority Alerts
          </h2>
          <div className="overflow-y-auto flex-grow pr-2">
            {alerts.length === 0 && (
              <p className="text-gray-400">No anomalies detected.</p>
            )}
            {alerts.map((alert) => (
              <div
                key={alert.transactionId}
                className="bg-red-900/30 border border-red-700 p-3 rounded-md mb-3 text-sm"
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
        <div className="lg:col-span-2 border border-gray-700 rounded-lg p-4 flex flex-col overflow-hidden">
          <h2 className="flex-shrink-0 text-lg font-semibold mb-3 border-b border-gray-700 pb-2">
            Live Transaction Feed
          </h2>
          <div
            ref={transactionLogRef}
            onScroll={handleScroll}
            className="overflow-y-auto flex-grow font-mono text-sm pr-2"
          >
            {transactions.map((tx) => (
              <div
                key={tx.transactionId}
                className={`flex justify-between p-1 items-center ${
                  tx.isAnomaly ? "font-bold text-red-400" : "text-gray-300"
                }`}
              >
                <span>{new Date(tx.timestamp).toLocaleTimeString()}</span>
                <span className="flex-1 text-center">
                  {tx.sourceCountry} → {tx.destCountry}
                </span>
                <span className="w-28 text-right">
                  ${tx.amount.toLocaleString("en-US")}
                </span>
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
