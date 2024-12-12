import fs from 'fs';
import path from 'path';
import https from 'https';

const FONTS_DIR = path.join(process.cwd(), 'public', 'fonts');
const FONT_URL = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/helvetiker_regular.typeface.json';

export async function downloadFont() {
    if (!fs.existsSync(FONTS_DIR)) {
        fs.mkdirSync(FONTS_DIR, { recursive: true });
    }

    const fontPath = path.join(FONTS_DIR, 'helvetiker_regular.typeface.json');

    if (!fs.existsSync(fontPath)) {
        return new Promise((resolve, reject) => {
            https.get(FONT_URL, (response) => {
                const file = fs.createWriteStream(fontPath);
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve(true);
                });
            }).on('error', (err) => {
                fs.unlinkSync(fontPath);
                reject(err);
            });
        });
    }
} 