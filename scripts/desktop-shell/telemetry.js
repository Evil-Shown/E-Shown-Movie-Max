const { app } = require("electron");
const fs = require("fs");
const path = require("path");
const http = require("http");
const crypto = require("crypto");

function postJson(url, data) {
  try {
    const parsed = new URL(url);
    const body = JSON.stringify(data);
    
    const req = http.request({
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body)
      }
    }, (res) => {
      res.resume();
    });
    
    req.on("error", (err) => {
      // Quiet fail if server is not up yet
      // This is expected during early boot sequence
    });
    
    req.write(body);
    req.end();
  } catch (err) {
    // Avoid crashing the shell
  }
}

function setupTelemetry() {
  const userDataPath = app.getPath("userData");
  const idFile = path.join(userDataPath, "telemetry-id.json");
  let clientId;
  
  try {
    if (fs.existsSync(idFile)) {
      const data = JSON.parse(fs.readFileSync(idFile, "utf8"));
      clientId = data.clientId;
    }
  } catch (e) {
    console.error("Failed to read telemetry ID file:", e.message);
  }
  
  if (!clientId) {
    clientId = crypto.randomUUID();
    try {
      fs.writeFileSync(idFile, JSON.stringify({ clientId }), "utf8");
    } catch (e) {
      console.error("Failed to write telemetry ID file:", e.message);
    }
  }
  
  const pingUrl = "http://127.0.0.1:5000/api/telemetry/ping";
  const heartbeatUrl = "http://127.0.0.1:5000/api/telemetry/heartbeat";
  
  // Delay initial ping slightly to let backend start
  setTimeout(() => {
    postJson(pingUrl, {
      clientId,
      version: app.getVersion(),
      platform: process.platform
    });
  }, 10000);
  
  // Heartbeat every 5 minutes
  setInterval(() => {
    postJson(heartbeatUrl, { clientId });
  }, 5 * 60 * 1000);
}

module.exports = { setupTelemetry };
