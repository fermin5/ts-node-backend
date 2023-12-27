## TS Node backend
This project is a backend REST API implemented using TypeScript and Node.js. It features a CRUD interface for user management, integrated Swagger documentation for API testing, and a Docker Compose setup for easy deployment.

## Features

- CRUD operations for user management (Create user, auth, list users, delete and update).
- JWT authentication for protected routes.
- PostgreSQL database integration with Sequelize ORM.
- Redis caching for improved performance.
- Swagger UI for API documentation and testing.
- Docker Compose setup for containerized deployment.
- Containerized tests for automated testing.

## Getting Started

To get the backend up and running, follow these steps:

### Prerequisites

- Docker and Docker Compose installed on your machine.

### Starting the Services

1. Clone the repository to your local machine.

```sh
git clone https://github.com/fermin5/ts-node-backend.git
```

2. Navigate to the root directory of the project.

```sh
cd ts-node-backend/
```

3. Run the following command to start all services:


```sh
docker-compose build
```

```sh
docker-compose up -d
```

This command will build and start the services defined in the `docker-compose.yml` file, including the Node.js application, PostgreSQL database, Redis server, and Nginx web server.

### Viewing the Swagger Documentation

Once the services are up, you can access the Swagger UI to test the API endpoints:
1. Open a web browser.
2. Go to `http://localhost/docs`.
3. You will see the Swagger UI, where you can execute API requests directly from the browser and also view the full API documentation

If you see a 502 error is because the backend is still starting, wait some seconds and refresh the website


### Running the tests

You can run the tests in a containerized envionment by running the following commands:

```sh
docker network create backend_network && \
docker build -t "testbuild" . && \
docker run --name=database -d -e POSTGRES_USER=docker-dev -e POSTGRES_PASSWORD=docker-dev-pass -e POSTGRES_DB=docker-pg -p 5432:5432 --network=backend_network postgres:latest && \
docker run --name=redis -d --network=backend_network redis:alpine && \
docker run --name=test -e DATABASE_URL=postgres://docker-dev:docker-dev-pass@database:5432/docker-pg -e REDIS_HOST=redis -e REDIS_PORT=6379 -it --rm --network=backend_network testbuild npm run test && \
docker rm -f database &&  \
docker rm -f redis &&  \
docker network rm backend_network
```

Which should run all the tests inside the /tests folder