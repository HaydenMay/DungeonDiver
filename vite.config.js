import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/DungeonDiver/' : '/',
  plugins: [
    {
      name: 'screenshot-server',
      configureServer(server) {
        server.middlewares.use('/api/screenshot', (req, res) => {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
              body += chunk;
            });
            req.on('end', () => {
              try {
                const data = JSON.parse(body);
                const base64Data = data.image.replace(/^data:image\/png;base64,/, '');
                const dir = path.resolve(__dirname, 'reference/screenshots');
                if (!fs.existsSync(dir)) {
                  fs.mkdirSync(dir, { recursive: true });
                }
                const filePath = path.join(dir, 'dungeon_diver_screenshot.png');
                fs.writeFileSync(filePath, base64Data, 'base64');
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, path: filePath }));
              } catch (err) {
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, error: err.message }));
              }
            });
          } else {
            res.statusCode = 405;
            res.end('Method Not Allowed');
          }
        });
      }
    }
  ]
});
