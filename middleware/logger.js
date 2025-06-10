const fs = require("fs");
const path = require("path");

const middleware = (req, res, next) => {
    if (req.url === '/favicon.ico') return next(); // skip logging favicon requests
    
    const visitor = {
        IP: req.socket.remoteAddress,
        UserAgent: req.headers["user-agent"],
        URL: req.url,
        Method: req.method,
        Time: new Date().toISOString()
    };

    // Format: visitor-YYYY-MM-DD.log
    const date = new Date().toISOString().split("T")[0];
    const fileName = `visitor-${date}.log`;

    // Use specified log directory or fallback to current working directory
    const logDir = process.env.log_Directory || path.join(process.cwd(), "logs");

    // Ensure log directory exists
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    const logFilePath = path.join(logDir, fileName);
    const logData = JSON.stringify(visitor) + "\n";

    fs.writeFile(logFilePath, logData, { flag: "a" }, (err) => {
        if (err) {
            console.error(`❌ Couldn't write to log file: ${err.message}`);
        } else {
            console.log("📝 Visitor logged:", visitor);
        }
    });

    next();
};

module.exports = middleware;
