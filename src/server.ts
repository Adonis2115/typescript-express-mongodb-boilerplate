import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { config } from './config/config';
import Logging from './library/Logging';

const router = express();

mongoose
	.connect(config.mongo.url)
	.then(() => {
		Logging.info('Connected to MongoDB');
		StartServer();
	})
	.catch((err) => {
		Logging.error('Unable to Connect to MongoDB');
		Logging.error(err);
	});

// Only Start the Server if Mongo Connects
const StartServer = () => {
	router.use((req, res, next) => {
		Logging.info(`Incoming -> Method: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);

		res.on('finish', () => {
			Logging.info(`Incoming -> Method: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}] - Status: [${res.statusCode}]`);
		});
		next();
	});

	router.use(express.urlencoded({ extended: true }));
	router.use(express.json());

	/** Rules of our API */
	router.use((req, res, next) => {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

		if (req.method == 'OPTIONS') {
			res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
			return res.status(200).json({});
		}

		next();
	});

	// Routes

	// Healthcheck
	router.get('/ping', (req, res, next) => res.status(200).json({ message: 'pong' }));

	// Error Handling
	router.use((req, res, next) => {
		const error = new Error('Not Found');
		Logging.error(error);

		return res.status(404).json({ message: error.message });
	});

	http.createServer(router).listen(config.server.port, () => Logging.info(`Server is running on Port: ${config.server.port}`));
};
