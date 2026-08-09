import config from './config/app.config.js';
import {server} from './bootstrap/server.js';
import { connectToDatabase } from './config/db.config.js';

(() =>
{
    try {
        connectToDatabase();
        server.listen(config.port, () => 
        {
            console.info(`server is running on port :${config.port}`);
        })

    } catch (error) {
        console.error.bind(console, 'the server could not be started');
    }
})();