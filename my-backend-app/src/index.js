import express from 'express';
import bodyParser from 'body-parser';
import { setUserRoutes } from './routes/userRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

setUserRoutes(app);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});