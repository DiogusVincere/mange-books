// backend/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info', // Define o nível de log padrão
  transports: [
    // Log para o console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // Log para um arquivo
    new winston.transports.File({
      filename: 'logs/app.log',
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ]
});

// Exporta o logger para ser usado em outros arquivos
module.exports = logger;
