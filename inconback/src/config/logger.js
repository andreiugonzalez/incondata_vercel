const winston = require("winston");
const { format } = require("date-fns");

const logger = winston.createLogger({
    levels: winston.config.syslog.levels,
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            const formattedTimestamp = format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss');
            return `${formattedTimestamp} ${level}: ${message}`;
        })
    ),
    transports: [new winston.transports.Console()],
});

module.exports = logger;
