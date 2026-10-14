// Local Development Server (Supports static assets, clean URLs, and serverless /api routes)
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const ROOT_DIR = __dirname;

// Auto-load .env file if present
const envPath = path.join(ROOT_DIR, '.env');
if (fs.existsSync(envPath)) {
    try {
        fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const eqIdx = trimmed.indexOf('=');
                if (eqIdx > 0) {
                    const key = trimmed.slice(0, eqIdx).trim();
                    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
                    if (!process.env[key]) process.env[key] = val;
                }
            }
        });
        console.log('[Dev Server] Loaded environment variables from .env');
    } catch (_) {}
}

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.sql': 'text/plain; charset=utf-8',
    '.md': 'text/markdown; charset=utf-8'
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    let pathname = decodeURIComponent(parsedUrl.pathname);

    // 1. Handle Vercel Serverless Function Routes (/api/*)
    if (pathname.startsWith('/api/send-order-sms')) {
        let bodyBuffer = '';
        req.on('data', chunk => {
            bodyBuffer += chunk;
        });

        req.on('end', async () => {
            try {
                req.body = bodyBuffer ? JSON.parse(bodyBuffer) : {};
            } catch (_) {
                req.body = bodyBuffer;
            }

            // Compatibility adapter for Vercel/Express res methods
            res.status = function (code) {
                res.statusCode = code;
                return this;
            };

            res.json = function (data) {
                if (!res.headersSent) {
                    res.setHeader('Content-Type', 'application/json');
                }
                res.end(JSON.stringify(data));
                return this;
            };

            try {
                // Clear require cache for live development reloads of the API
                delete require.cache[require.resolve('./api/send-order-sms.js')];
                const handler = require('./api/send-order-sms.js');
                await handler(req, res);
            } catch (err) {
                console.error('[Dev Server API Error]:', err);
                if (!res.headersSent) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Internal Server Error' }));
                }
            }
        });
        return;
    }

    // 2. Normalize Static File Path & Support Clean URLs
    if (pathname === '/') {
        pathname = '/index.html';
    }

    let filePath = path.join(ROOT_DIR, pathname);

    // Prevent directory traversal attacks
    if (!filePath.startsWith(ROOT_DIR)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden');
        return;
    }

    // If file does not exist, check if appending .html works (Clean URLs support)
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        const htmlPath = filePath + '.html';
        const indexHtml = path.join(filePath, 'index.html');
        if (fs.existsSync(htmlPath) && fs.statSync(htmlPath).isFile()) {
            filePath = htmlPath;
        } else if (fs.existsSync(indexHtml) && fs.statSync(indexHtml).isFile()) {
            filePath = indexHtml;
        }
    }

    // Check file existence
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head><title>404 Not Found - R-Tech Pure Water</title></head>
            <body style="font-family:sans-serif;text-align:center;padding:50px;">
                <h2>404 - Page Not Found</h2>
                <p>The requested file <code>${escapeHtml(pathname)}</code> does not exist.</p>
                <p><a href="/" style="color:#087fdb;">← Back to Home</a></p>
            </body>
            </html>
        `);
        return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Stream file response
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
});

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[s]));
}

server.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`💧 R-Tech Pure Water - Local Development Server`);
    console.log(`==================================================`);
    console.log(`Local Server:   http://localhost:${PORT}`);
    console.log(`Admin Portal:   http://localhost:${PORT}/admin/login.html`);
    console.log(`API Endpoint:   http://localhost:${PORT}/api/send-order-sms`);
    console.log(`Owner Target:   +91 80566 39518`);
    console.log(`==================================================\n`);
});
