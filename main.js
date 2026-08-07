const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');

let mainWindow;
let server;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

function startInternalServer() {
  return new Promise((resolve) => {
    const outDir = path.join(__dirname, 'out');

    server = http.createServer((req, res) => {
      let cleanUrl = req.url.split('?')[0];
      let filePath = path.join(outDir, cleanUrl === '/' ? 'index.html' : cleanUrl);

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(outDir, 'index.html');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(404);
          res.end('File Not Found');
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content);
        }
      });
    });

    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve(port);
    });
  });
}

async function createWindow() {
  const port = await startInternalServer();

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'NativeBOX AI - 동영상 문장 자동 분할 어학 플레이어',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(`http://127.0.0.1:${port}`);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (server) server.close();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
