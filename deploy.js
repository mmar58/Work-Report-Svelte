import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BUILD_DIR = path.join(__dirname, 'build');
const DEST_DIR = 'G:\\Server\\workReport';

async function deploy() {
    console.log(`Starting deployment...`);
    console.log(`Source: ${BUILD_DIR}`);
    console.log(`Destination: ${DEST_DIR}`);

    try {
        // Check if build dir exists
        await fs.access(BUILD_DIR);
    } catch {
        console.error(`Error: Build directory not found at ${BUILD_DIR}. Run 'npm run build' first.`);
        process.exit(1);
    }

    try {
        // Ensure destination dir exists
        await fs.mkdir(DEST_DIR, { recursive: true });

        // Empty destination directory
        console.log('Cleaning destination directory...');
        const entries = await fs.readdir(DEST_DIR);
        for (const entry of entries) {
            const entryPath = path.join(DEST_DIR, entry);
            await fs.rm(entryPath, { recursive: true, force: true });
        }

        // Copy build files
        console.log('Copying build files...');

        // Node 16.7.0+ supports fs.cp (recursive copy)
        // If you are on an older version, we might need a different approach or fs-extra
        // But assuming modern environment:
        await fs.cp(BUILD_DIR, DEST_DIR, { recursive: true });

        console.log('Deployment complete success!');
        console.log(`Files deployed to ${DEST_DIR}`);
    } catch (err) {
        console.error('Deployment failed:', err);
        process.exit(1);
    }
}

deploy();
