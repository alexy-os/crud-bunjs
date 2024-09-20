import { createServer, IncomingMessage, ServerResponse } from 'http';
import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
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
                        <td>${String(item.id)}</td>
                        <td>${item.title}</td>
                        <td>
                            <button class="edit-btn" data-id="${String(item.id)}">Edit</button>
                            <button class="delete-btn" data-id="${String(item.id)}">Delete</button>
                        </td>
                    </tr>`;
                    tbody.append(row);
                });

                res.setHeader('Content-Type', 'text/html');
                res.end($.html());
            }
        });
    } else if (url && url.startsWith('/items')) {
        const idMatch = url.match(/^\/items\/([a-zA-Z0-9_-]+)$/);
        if (method === 'GET' && url === '/items') {
            // Return all items as JSON
            const items = await database.getAllItems();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(items));
        } else if (method === 'GET' && idMatch) {
            // Get a single item
            const id = idMatch[1];
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
                const id = idMatch;
                const body = await getRequestBody(req);
                const { title } = body;
                await database.updateItem(idMatch[1], title);
                res.end('Item updated');
            } catch (err) {
                res.statusCode = 400;
                res.end('Invalid request');
            }
        } else if (method === 'DELETE' && idMatch) {
            // Delete item
            const id = idMatch[1];
            await database.deleteItem(id);
            res.end('Item deleted');
        } else {
            res.statusCode = 404;
            res.end('Not found');
        }
    } else if (url && url.startsWith('/static/')) {
        // Serve static files (if needed)
        const filePath = path.join(__dirname, url);
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