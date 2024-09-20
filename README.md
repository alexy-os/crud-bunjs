# CRUD Application with LMDB and Bun

This project implements a fully functional CRUD application using Bun and LMDB. The server-side code is written in TypeScript and follows an object-oriented approach. The application performs all four CRUD operations (Create, Read, Update, Delete) on an LMDB database stored in the `base.mdb` file.

The client-side interface is a simple table with two fields: `id` and `title`. Users can add, edit, and delete records through a modal window. The client communicates with the server via AJAX requests to the CRUD endpoints.

### Project Structure

```bash
/data/base.mdb 
/index.ts
/index.html
```

- **Server**: The server is built with Bun and runs on port `5000`. It provides an API for handling CRUD operations using LMDB.
- **Client**: A simple front-end interface allows users to interact with the data through a dynamic HTML table, using Cheerio for server-side HTML manipulation.

### Features
- **Object-Oriented Design**: The project is written using OOP principles to ensure maintainability and scalability. A universal database connector is provided for interacting with LMDB.
- **CRUD Operations**: Supports creating, reading, updating, and deleting records in the LMDB database.
- **AJAX Communication**: The front-end communicates with the server asynchronously via AJAX requests to perform CRUD operations.
- **Cheerio for Dynamic Content**: The table and modal content are dynamically generated and updated using the Cheerio library on the server side.
- **Client-Server Architecture**: The client-side interface updates dynamically based on the data retrieved from the LMDB database via the server.

### Requirements
- **Bun**: This project requires the Bun runtime for execution.
- **LMDB**: Lightning Memory-Mapped Database is used for data storage.
- **Cheerio**: A lightweight, fast HTML parser used for handling dynamic HTML content.

### How to Run
1. Clone the repository.
2. Install Bun and dependencies:

```bash
bun install
```
3. Run the project with the following command:

```bash
bun run index.ts
```

4. The server will start on `http://localhost:5000`, where you can interact with the CRUD interface.

### Endpoints
- **Create**: `POST /create`
- **Read**: `GET /read`
- **Update**: `POST /update`
- **Delete**: `POST /delete`

### Front-End Table
- Displays the `id` and `title` of records stored in the LMDB database.
- Users can add, edit, and delete records via the modal window.


This project was created using `bun init` in bun v1.1.27. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.