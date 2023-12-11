import winston from "winston";
import config from "../config.js"
import customLevels from './custom.logger.js';

export let logger;

if (config.ENVIRONMENT === 'PRODUCTION') {
  logger = winston.createLogger({
    levels: customLevels.levels,
    transports: [
      new winston.transports.Console({
        level: 'info',
        format: winston.format.combine(
          winston.format.colorize({colors: customLevels.colors}), 
          winston.format.simple()
        )
      }),
      new winston.transports.File({
        level: "error", 
        filename: "./errors.log",
        format: winston.format.simple()
      })
    ]
  });
} else {
  logger = winston.createLogger({
    levels: customLevels.levels,
    transports: [
    new winston.transports.Console({
        level: 'debug',
        format: winston.format.combine(
          winston.format.colorize({colors: customLevels.colors}), 
          winston.format.simple()
        )
      })
    ]
  });
};


export const addLogger = (req, res, next) => {
  req.logger = logger;
  req.logger.http(`${req.method} en ${req.url} - ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`);
  next();
};