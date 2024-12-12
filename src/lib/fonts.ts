import path from 'path';

const FONTS_DIR = path.join(process.cwd(), 'public', 'fonts');
const FONT_FILENAME = 'helvetiker_regular.typeface.json';

export const getFontPath = () => {
    return `/fonts/${FONT_FILENAME}`;
}; 