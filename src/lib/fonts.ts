import fs from 'fs/promises';
import path from 'path';
import https from 'https';

const FONTS_DIR = path.join(process.cwd(), 'public', 'fonts');
const FONT_URL = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/helvetiker_regular.typeface.json';

export async function ensureFontExists() {
    try {
        await fs.mkdir(FONTS_DIR, { recursive: true });
        const fontPath = path.join(FONTS_DIR, 'helvetiker_regular.typeface.json');

        try {
            await fs.access(fontPath);
            // Font exists
            return true;
        } catch {
            // Font doesn't exist, download it
            return new Promise((resolve, reject) => {
                https.get(FONT_URL, (response) => {
                    if (response.statusCode !== 200) {
                        reject(new Error(`Failed to download font: ${response.statusCode}`));
                        return;
                    }

                    const fileStream = fs.createWriteStream(fontPath);
                    response.pipe(fileStream);

                    fileStream.on('finish', () => {
                        fileStream.close();
                        resolve(true);
                    });
                }).on('error', reject);
            });
        }
    } catch (error) {
        console.error('Error ensuring font exists:', error);
        return false;
    }
} 