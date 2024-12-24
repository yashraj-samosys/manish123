import express from 'express';
import router from './routes/routes.js';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import path from 'path';
import cors from 'cors';

// Create __dirname manually because you're using ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ensure that the path is correct for your uploads folder
app.use(express.static(path.join(__dirname, 'uploads')));

app.use("/user", router);

app.listen(3001, () => {
    console.log("Server invoked at http://localhost:3001");
});
