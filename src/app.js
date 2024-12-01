import express from 'express'
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import cors from 'cors';
import {createDataFileIfNotExists} from "./data.js";
import patientRouter from "./routers/patient.router.js";

const app = express()

app.use(cors());

app.use(express.static('www'));
app.use(express.json());

app.use(createDataFileIfNotExists());

// TODO: Add Authentication middleware.
app.use('/', patientRouter)

const openAPIOptions = {
    failOnErrors: true,
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Patient service',
            version: '1.0.0',
        },
    },
    apis: ['./routers/patient.router.js'],
};

const openapiSpecification = swaggerJsdoc(openAPIOptions);
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(openapiSpecification)
);


export default app
