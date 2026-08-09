import morgan from 'morgan';
import config from '../../config/app.config.js';

const logger = () => morgan(config.environment === "development" ? "dev" : "combined");

export default logger;
