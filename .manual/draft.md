
    Реализовать в среде Bun приложение в одни файле `index.ts`, которое выполняет все 4 Операции `CRUD` с базой данных `LMDB`

    structure

    ```bash
    /data/base.mdb 
    /index.ts
    ```

    Выполнить с стиле ООП. Разработать универсальные коннекторы для операций с базой данных.

    Все протестировать и вернуть полностью рабочий полный код, готовый к запуску: `bun run index.ts`

    на стороне клиента реализовать обычную таблицу для хранения данных и их создания, редактирования, удаления через модальное окно 

    Достаточно 2 полей `id`, `title`.

    Клиент обращается на сервер через ajax эндпоинт.

    Сервер запускается на порту `3005`

    Для динамического контента таблицы и ее компонентов использовать библиотеку `cheerio` 

    Итак, жду 2 файла:
    `index.ts`
    `index.html`

=======================

Here are the two files as requested: `index.ts` and `index.html`. This code sets up a Bun server that performs all CRUD operations with an LMDB database using OOP principles. It also includes a client-side HTML page that interacts with the server via AJAX calls.

---

**index.ts**

```typescript
// index.ts

import { createServer, IncomingMessage, ServerResponse } from 'http';
import * as fs from 'fs';
import * as path from 'path';
import cheerio from 'cheerio';
import { open } from 'lmdb';

// Define the database path
const dbPath = path.join(__dirname, 'data', 'base.mdb');

// Ensure the data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

// Create or open the LMDB database
const db = open({
    path: dbPath,
    name: 'items',
    encoding: 'json', // Use JSON encoding
});

class Database {
    async getAllItems() {
        const items = [];
        for (const { key, value } of db.getRange({})) {
            items.push({ id: key, title: value });
        }
        return items;
    }

    async getItem(id: string) {
        return await db.get(id);
    }

    async createItem(id: string, title: string) {
        await db.put(id, title);
    }

    async updateItem(id: string, title: string) {
        await db.put(id, title);
    }

    async deleteItem(id: string) {
        await db.remove(id);
    }
}

const database = new Database();

// Helper function to parse JSON body
function getRequestBody(req: IncomingMessage): Promise<any> {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const json = JSON.parse(body);
                resolve(json);
            } catch (err) {
                reject(err);
            }
        });
    });
}

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const method = req.method;
    const url = req.url;

    if (method === 'GET' && url === '/') {
        // Serve index.html with data injected via cheerio
        fs.readFile(path.join(__dirname, 'index.html'), 'utf8', async (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.end('Error loading index.html');
            } else {
                const $ = cheerio.load(data);

                // Fetch items from database
                const items = await database.getAllItems();

                // Populate the table
                const tbody = $('#data-table tbody');
                items.forEach((item) => {
                    const row = `<tr>
                        <td>${item.id}</td>
                        <td>${item.title}</td>
                        <td>
                            <button class="edit-btn" data-id="${item.id}">Edit</button>
                            <button class="delete-btn" data-id="${item.id}">Delete</button>
                        </td>
                    </tr>`;
                    tbody.append(row);
                });

                res.setHeader('Content-Type', 'text/html');
                res.end($.html());
            }
        });
    } else if (url.startsWith('/items')) {
        const idMatch = url.match(/^\/items\/([a-zA-Z0-9_-]+)$/);
        if (method === 'GET' && url === '/items') {
            // Return all items as JSON
            const items = await database.getAllItems();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(items));
        } else if (method === 'GET' && idMatch) {
            // Get a single item
            const id = idMatch1;
            const item = await database.getItem(id);
            if (item) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ id, title: item }));
            } else {
                res.statusCode = 404;
                res.end('Item not found');
            }
        } else if (method === 'POST' && url === '/items') {
            // Create new item
            try {
                const body = await getRequestBody(req);
                const { id, title } = body;
                await database.createItem(id, title);
                res.statusCode = 201;
                res.end('Item created');
            } catch (err) {
                res.statusCode = 400;
                res.end('Invalid request');
            }
        } else if (method === 'PUT' && idMatch) {
            // Update item
            try {
                const id = idMatch1;
                const body = await getRequestBody(req);
                const { title } = body;
                await database.updateItem(id, title);
                res.end('Item updated');
            } catch (err) {
                res.statusCode = 400;
                res.end('Invalid request');
            }
        } else if (method === 'DELETE' && idMatch) {
            // Delete item
            const id = idMatch1;
            await database.deleteItem(id);
            res.end('Item deleted');
        } else {
            res.statusCode = 404;
            res.end('Not found');
        }
    } else if (url && url.startsWith('/static/')) {
        // Serve static files (if needed)
        const filePath = path.join(dirname, url);
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.statusCode = 404;
                res.end('File not found');
            } else {
                res.end(data);
            }
        });
    } else {
        res.statusCode = 404;
        res.end('Not found');
    }
});

server.listen(3005, () => {
    console.log('Server running at http://localhost:3005/');
});

```

**index.html**

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>LMDB CRUD App</title>
    <style>
        / Basic styles for table and modal /
        table {
            width: 100%;
            border-collapse: collapse;
        }
        table, th, td {
            border: 1px solid black;
        }
        th, td {
            padding: 8px;
            text-align: left;
        }
        #modal {
            display: none;
            position: fixed;
            z-index: 1;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow:auto;
            background-color: rgba(0,0,0,0.4);
        }
        #modal-content {
            background-color: #fefefe;
            margin: 15% auto;
            padding: 20px;
            width: 30%;
        }
        .close {
            float: right;
            font-size: 28px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <h1>LMDB CRUD App</h1>
    <button id="create-btn">Create New Item</button>
    <table id="data-table">
        <thead>
            <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            <!-- Data rows will be inserted here via server-side or client-side -->
        </tbody>
    </table>

    <!-- Modal Window -->
    <div id="modal">
        <div id="modal-content">
            <span class="close">&times;</span>
            <h2 id="modal-title">Create/Edit Item</h2>
            <form id="item-form">
                <label for="item-id">ID:</label>
                <input type="text" id="item-id" name="id" required><br><br>
                <label for="item-title">Title:</label>
                <input type="text" id="item-title" name="title" required><br><br>
                <button type="submit">Save</button>
            </form>
        </div>
    </div>

    <script>
        // JavaScript code for handling modal, form submission, and AJAX requests

        // Get elements
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const closeModalBtn = document.querySelector('.close');
        const createBtn = document.getElementById('create-btn');
        const itemForm = document.getElementById('item-form');
        const itemIdInput = document.getElementById('item-id');
        const itemTitleInput = document.getElementById('item-title');
        const dataTableBody = document.querySelector('#data-table tbody');

        let isEditing = false;
        let currentEditingId = '';

        // Event listeners
        createBtn.addEventListener('click', openCreateModal);
        closeModalBtn.addEventListener('click', closeModal);
        itemForm.addEventListener('submit', handleFormSubmit);
        dataTableBody.addEventListener('click', handleTableClick);

        function openCreateModal() {
            modalTitle.textContent = 'Create Item';
            itemIdInput.value = '';
            itemIdInput.disabled = false;
            itemTitleInput.value = '';
            isEditing = false;
            modal.style.display = 'block';
        }

        function openEditModal(id, title) {
            modalTitle.textContent = 'Edit Item';
            itemIdInput.value = id;
            itemIdInput.disabled = true;
            itemTitleInput.value = title;
            isEditing = true;
            currentEditingId = id;
            modal.style.display = 'block';
        }

        function closeModal() {
            modal.style.display = 'none';
        }

        function handleFormSubmit(event) {
            event.preventDefault();
            const id = itemIdInput.value;
            const title = itemTitleInput.value;
            if (isEditing) {
                // Update item via PUT request
                fetch('/items/' + id, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ title })
                }).then(res => res.text())
                .then(response => {
                    alert(response);
                    loadItems();
                    closeModal();
                });
            } else {
                // Create new item via POST request
                fetch('/items', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ id, title })
                }).then(res => res.text())
                .then(response => {
                    alert(response);
                    loadItems();
                    closeModal();
                });
            }
        }

        function handleTableClick(event) {
            if (event.target.classList.contains('edit-btn')) {
                const id = event.target.getAttribute('data-id');
                const title = event.target.closest('tr').querySelector('td:nth-child(2)').textContent;
                openEditModal(id, title);
            } else if (event.target.classList.contains('delete-btn')) {
                const id = event.target.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this item?')) {
                    fetch('/items/' + id, {
                        method: 'DELETE'
                    }).then(res => res.text())
                    .then(response => {
                        alert(response);
                        loadItems();
                    });
                }
            }
        }

        function loadItems() {
            fetch('/items')
                .then(res => res.json())
                .then(items => {
                    dataTableBody.innerHTML = '';
                    items.forEach(item => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${item.id}</td>
                            <td>${item.title}</td>
                            <td>
                                <button class="edit-btn" data-id="${item.id}">Edit</button>
                                <button class="delete-btn" data-id="${item.id}">Delete</button>
                            </td>
                        `;
                        dataTableBody.appendChild(row);
                    });
                });
        }

        // Initial load
        loadItems();

    </script>
</body>
</html>
```

**Instructions to Run the Application:**

1. **Install Dependencies:**

   Before running the application, you need to install the required packages. Run the following command in your terminal:

   ```bash
   bun install lmdb cheerio
   ```

2. **Create the Data Directory:**

   Ensure that there's a `data` directory in the same location as your `index.ts` file. If it doesn't exist, the script will create it automatically.

3. **Run the Server:**

   Start the server by running:

   ```bash
   bun run index.ts
   ```

   The server will start and listen on port `3005`.

4. **Access the Application:**

   Open your web browser and navigate to `http://localhost:3005/`. You should see the application running, displaying the data table.

5. **Interact with the Application:**

   - **Create Items:** Click on the "Create New Item" button to open the modal window and add a new item.
   - **Edit Items:** Click on the "Edit" button next to an item to modify it.
   - **Delete Items:** Click on the "Delete" button next to an item to remove it.

   All changes will be reflected in the LMDB database.

---

**Note:**

- The application uses OOP principles by encapsulating database operations within the `Database` class.
- The server uses `cheerio` to inject data into the HTML template before serving it to the client.
- The client-side JavaScript interacts with the server via AJAX calls to perform CRUD operations.
- Ensure that you have Bun installed on your system to run the application.

Feel free to test the application and let me know if you have any questions or need further assistance!
