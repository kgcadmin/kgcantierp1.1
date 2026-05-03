import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');

console.log('--- DIAGNOSTIC START ---');
console.log('Current Directory:', process.cwd());
console.log('Script Directory:', __dirname);
console.log('Looking for .env at:', envPath);

if (fs.existsSync(envPath)) {
    console.log('✅ .env file FOUND');
    const result = dotenv.config({ path: envPath });
    if (result.error) {
        console.error('❌ Dotenv Error:', result.error);
    } else {
        console.log('✅ Dotenv loaded successfully');
    }
} else {
    console.error('❌ .env file NOT FOUND at the expected path');
}

console.log('--- ENVIRONMENT VARIABLES ---');
console.log('PORT:', process.env.PORT || 'Not set (default 5000)');
console.log('SMTP_HOST:', process.env.SMTP_HOST || 'Not set');
console.log('SMTP_USER:', process.env.SMTP_USER || 'Not set');
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✅ SET (masked)' : '❌ NOT SET');
console.log('--- DIAGNOSTIC END ---');
