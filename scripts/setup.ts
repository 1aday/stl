import { downloadFont } from '../src/utils/setupFonts';

async function setup() {
    try {
        await downloadFont();
        console.log('Font setup completed successfully');
    } catch (error) {
        console.error('Error setting up fonts:', error);
        process.exit(1);
    }
}

setup(); 