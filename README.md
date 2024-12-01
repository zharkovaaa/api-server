# Patient Queue Management Service

This is a simple RESTful service to manage patient information in a queue system. It allows adding, removing, and updating patient information, with endpoints exposed via HTTP methods.

## Features

- **Patient Admission**: Add a new patient to the queue.
- **Patient Removal**: Remove a patient from the queue by their queue number.
- **Patient Update**: Update an existing patient's information.
- **Swagger Documentation**: Provides an interactive API documentation at http://localhost:8000/api-docs.

## Technologies

- Node.js (v18+)
- Express.js
- Swagger UI for API documentation
- Swagger JSDoc for auto-generating OpenAPI specs
- JSON file storage for simplicity

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18+)

### Installation

1. Install the project dependencies:

   ```bash
   npm install

### Running the API server

1. Run the following command to start the server:

    ```bash
    npm start

### API Endpoints

1.  GET `/patients/`
    *Description*: Get all patients in the queue.
2.  POST `/patients/do-admiss`
    *Description*: Adds a new patient to the queue.
    *Important*: Before performing any other operations (e.g., updating or removing a patient), you must first create a patient using the /patients/do-admiss POST request. The patient ***must*** exist in the queue before interacting with it in other ways.
3.  DELETE `/patients/remove`
    *Description*: Removes a patient from the queue by their queueNumber.
4.  PUT `/patients/update`
    *Description*: Updates an existing patient's information based on their queueNumber.



