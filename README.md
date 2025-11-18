# My List Feature Backend

This project implements the "My List" feature for an OTT platform, allowing users to save their favorite movies and TV shows to a personalized list. The backend service provides APIs for adding, removing, and listing saved items, focusing on scalability, performance, and robust testing.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup and Running](#setup-and-running)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
  - [Running Tests](#running-tests)
  - [Seeding the Database](#seeding-the-database)
- [API Endpoints](#api-endpoints)
- [Design Choices](#design-choices)
  - [Database Schema](#database-schema)
  - [Performance and Scalability](#performance-and-scalability)
- [Assumptions](#assumptions)
- [CI/CD (Planned)](#ci/cd-planned)
- [Deployment (Planned)](#deployment-planned)

## Features

- Add item to "My List": Users can add movies or TV shows to their personalized list. Duplicates are prevented.
- Remove item from "My List": Users can remove items from their list.
- List "My Items": Retrieve all items in a user's list with pagination.

## Technologies Used

- **Backend Framework**: Nest.js (TypeScript)
- **Database**: MongoDB (via Mongoose)
- **Testing Framework**: Jest, Supertest

## Setup and Running

### Prerequisites

- Node.js (v18 or higher)
- npm
- MongoDB instance running locally or accessible via a connection string.

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd my-list-backend
```

2. Install dependencies:

```bash
npm install
```

### Running the Application

1. Ensure MongoDB is running.
2. Start the Nest.js application:

```bash
npm run start:dev
```

The application will be accessible at `http://localhost:3000`.

### Running Tests

To run the integration tests:

```bash
npm run test:e2e
```

**Note**: Tests now utilize mocked services and do not require a running MongoDB instance. They simulate API interactions by overriding service dependencies with in-memory mock data.

### Seeding the Database

To populate MongoDB with sample users, movies, TV shows, and pre-added list items for **development or manual testing purposes** (not for e2e tests), run the seed script:

```bash
npm run seed
```

**Note**: This script will clear all existing data in the `Users`, `Movies`, `TVShows`, and `MyListItem` collections before seeding. The e2e tests do not use this script for data setup; they rely on mocked data.

## API Endpoints

All endpoints are prefixed with `/mylist`.

### `POST /mylist`

Adds a movie or TV show to the user's list. The `contentType` is automatically determined by the backend based on `contentId`.

- **Request Body**:
  ```json
  {
    "username": "string",
    "contentId": "string"
  }
  ```
- **Responses**:
  - `201 Created`: Item successfully added.
  - `404 Not Found`: User or Content not found.
  - `409 Conflict`: Item already exists in the user's list.

### `DELETE /mylist/:username/:contentId`

Removes an item from the user's list.

- **Request Parameters**:
  - `username`: The username of the user.
  - `contentId`: The ID of the movie or TV show to remove.
- **Responses**:
  - `200 OK`: Item successfully removed.
  - `404 Not Found`: User or Item not found in the user's list.

### `GET /mylist`

Retrieves all items in the user's list with pagination.

- **Request Query Parameters**:
  - `username` (required): The username of the user.
  - `page` (optional): Page number (default: 1).
  - `limit` (optional): Items per page (default: 10).
- **Responses**:
  - `200 OK`:
    ```json
    {
      "data": [
        { "_id": "string", "userId": "string", "contentId": "string", "contentType": "Movie", "contentDetails": { /* Object from Movie or TVShow schema */ } }
      ],
      "total": "number",
      "page": "number",
      "limit": "number",
      "totalPages": "number"
    }
    ```

### Content Listing Endpoint
All content listing endpoints are prefixed with `/content`.

#### `GET /content`

Retrieves a paginated list of movies, TV shows, or both.

- **Request Query Parameters**:
  - `type` (optional): Filter by content type ('Movie' or 'TVShow').
  - `page` (optional): Page number (default: 1).
  - `limit` (optional): Items per page (default: 10).
- **Responses**:
  - `200 OK`:
    ```json
    {
      "data": [
        { /* Object from Movie or TVShow schema */ }
      ],
      "total": "number",
      "page": "number",
      "limit": "number",
      "totalPages": "number"
    }
    ```

### User Management Endpoints
All user management endpoints are prefixed with `/user`.

#### `POST /user`

Creates a new user.

- **Request Body**:
  ```json
  {
    "username": "string",
    "favoriteGenres": ["string"],
    "dislikedGenres": ["string"]
  }
  ```
- **Responses**:
  - `201 Created`: User successfully created.
  - `409 Conflict`: Username already exists.

#### `GET /user`

Retrieves user details by username.

- **Request Query Parameters**:
  - `username` (required): The username of the user to retrieve.

- **Responses**:
  - `200 OK`: User details returned.
  - `404 Not Found`: User not found.

## Design Choices

### Database Schema

- **`MyListItem` Collection**: Stores `userId`, `contentId`, and `contentType`. A compound unique index on `(userId, contentId)` prevents duplicate entries for a user.
- **`User`, `Movie`, `TVShow` Collections**: Basic schemas are defined to represent these entities and allow for content population in the `GET /mylist` API. In a real system, these would likely be more comprehensive and managed by other services.

### Performance and Scalability

- **Indexes**: Critical indexes (`userId` and `contentId`) are created on the `MyListItem` collection to ensure fast lookups, especially for the `GET /mylist` endpoint which is expected to be highly performant (under 10ms).
- **Pagination**: The `GET /mylist` endpoint implements cursor-based pagination to efficiently retrieve large lists without heavy memory consumption on the server.
- **Lean Queries**: Mongoose `.lean()` method is used where possible to return plain JavaScript objects instead of Mongoose documents, reducing overhead and improving query performance.
- **Promise.all for Content Population**: When fetching `MyListItem` entries and then populating their details from `Movie` or `TVShow` collections, `Promise.all` is used to execute these content detail fetches concurrently, minimizing latency.

## Assumptions

- **User Authentication**: A basic user authentication system is assumed to be in place. The `userId` is currently passed directly in the request body/query for simplicity in this assignment. In a production environment, this would typically be extracted from an authenticated session or token.
- **Content Existence**: It is assumed that `contentId` values provided for adding items to the list correspond to existing `Movie` or `TVShow` entries in their respective collections.

## CI/CD (Planned)

For a production setup, a CI/CD pipeline would be implemented using tools like GitHub Actions to automate:

1.  **Code Linting and Formatting**: Ensure code quality and consistency.
2.  **Unit and Integration Testing**: Automatically run all tests upon code push.
3.  **Docker Image Build**: Build a Docker image of the application.
4.  **Deployment to Cloud Provider**: Deploy the Docker image to a chosen cloud service (e.g., AWS ECS, Kubernetes).

## Deployment (Planned)

### Live Demo

You can access a live demo of the application here: [https://streaming-backend-ruddy.vercel.app/](https://streaming-backend-ruddy.vercel.app/)

The service can be deployed using Docker to any cloud provider. An example `Dockerfile` would be:

```dockerfile
# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy typescript source code to the working directory
COPY . .

# Build the TypeScript application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Run the application
CMD ["node", "dist/main"]
```
