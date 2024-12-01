/**
 * @openapi
 * components:
 *   schemas:
 *     Patient:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - emailAddress
 *         - phoneNumber
 *         - sex
 *       properties:
 *         firstName:
 *           type: string
 *           description: Firstname
 *         lastName:
 *           type: string
 *           description: Lastname
 *         emailAddress:
 *           type: string
 *           description: Persons email address
 *         phoneNumber:
 *           type: string
 *           description: Persons phone number
 *         sex:
 *           type: string
 *           enum: [female, male]
 *           description: Sex of the person
 *     QueueEntry:
 *       type: object
 *       required:
 *         - queueNumber
 *       properties:
 *         queueNumber:
 *           type: number
 *           description: The number is the waiting queue.
 */

import {Router} from "express";
import {existsSync, promises} from "fs";

const DATA_FILE = './patients.json';

async function savePatients(patients){
    await promises.writeFile(DATA_FILE, JSON.stringify(patients), {encoding: 'utf-8'})
}

async function readPatients(){
    if (existsSync(DATA_FILE)){
        const text = await promises.readFile(DATA_FILE, {encoding: 'utf8'})
        return JSON.parse(text);
    }

    return [];
}

const patientsRouter = Router();
/**
 * @openapi
 * /patients:
 *   get:
 *     summary: Get all patients in the queue
 *     description: Retrieves a list of all patients in the queue.
 *     responses:
 *       200:
 *         description: A list of patients in the queue.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Patient'
 */
patientsRouter.get('/patients', async (req, res) => {
    try {
        const patients = await readPatients();
        res.status(200).json(patients);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve patients.' }); // Handle any errors
    }
});

/**
 * @openapi
 * /patients/do-admiss:
 *   post:
 *      summary: Add a new patient to the queue.
 *      description: Adds a new patient to the queue.
 *      requestBody:
 *          description: The data of the patient.
 *          required: true
 *          content:
 *                application/json:
 *                     schema:
 *                        $ref: '#/components/schemas/Patient'
 *      responses:
 *         200:
 *              description: Patient admission was successful.
 *              content:
 *                application/json:
 *                  schema:
 *                    $ref: '#/components/schemas/QueueEntry'
 */

patientsRouter.post(
    '/patients/do-admiss',
    async (request, response) => {

        const data = request.body;

        const patients = await readPatients();
        const queueNumbers = patients.map(patient => patient.queueNumber);
        const nextQueueNumber = queueNumbers.length > 0 ? Math.max(...queueNumbers) + 1: 1

        patients.push({...data, queueNumber: nextQueueNumber});
        await savePatients(patients);

        response.send({queueNumber: nextQueueNumber})
    })

/**
 * @openapi
 * /patients/update:
 *   put:
 *     summary: Update existing patient's information.
 *     description: Update existing patient's information in the queue.
 *     requestBody:
 *       description: The data of the patient.
 *       required: true
 *       content:
 *               application/json:
 *                     schema:
 *                        $ref: '#/components/schemas/Patient'
 *     responses:
 *       200:
 *         description: Patient information updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Patient information updated successfully."
 *       400:
 *         description: Invalid queue number or invalid data provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid queue number or missing required fields."
 *       404:
 *         description: Patient not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Patient not found."
 */

patientsRouter.put('/patients/update', async (req, res) => {
    const queueNumber = parseInt(req.body.queueNumber, 10);

    if (isNaN(queueNumber)) {
        return res.status(400).json({ error: 'Invalid queue number.' });
    }

    const { firstName, lastName, emailAddress, phoneNumber, sex } = req.body;

    const patients = await readPatients();
    const patientIndex = patients.findIndex(patient => patient.queueNumber === queueNumber);

    if (patientIndex === -1) {
        return res.status(404).json({ error: 'Patient not found.' });
    }

    // Update the patient's details
    patients[patientIndex] = {
        ...patients[patientIndex],
        firstName,
        lastName,
        emailAddress,
        phoneNumber,
        sex
    };

    await savePatients(patients);

    res.status(200).json({ message: 'Patient information updated successfully.' });
});

/**
 * @openapi
 * /patients/remove:
 *   delete:
 *     summary: Remove a patient by queue number
 *     description: Removes a patient from the queue based on their queue number.
 *     parameters:
 *       - name: queueNumber
 *         in: query
 *         description: The queue number of the patient to remove
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Patient removed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Patient removed successfully."
 *       404:
 *         description: Patient not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Patient not found."
 */

patientsRouter.delete('/patients/remove', async (req, res) => {
    const queueNumber = parseInt(req.query.queueNumber, 10);

    if (isNaN(queueNumber)) {
        return res.status(400).json({ error: 'Invalid queue number.' });
    }

    const patients = await readPatients();
    const patientIndex = patients.findIndex(patient => patient.queueNumber === queueNumber);

    if (patientIndex === -1) {
        return res.status(404).json({ error: 'Patient not found.' });
    }

    // Remove the patient
    patients.splice(patientIndex, 1);
    await savePatients(patients);

    res.status(200).json({ message: 'Patient removed successfully.' });
});


export default patientsRouter;