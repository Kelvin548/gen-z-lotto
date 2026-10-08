// jest.setup.js
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

// Point the test environment to the main synced database instead of a separate unmigrated test database
process.env.DATABASE_URL = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/gen_z_lotto';
if (!process.env.DATABASE_URL.startsWith('mysql://')) {
  process.env.DATABASE_URL = `mysql://${process.env.DATABASE_URL}`;
}

jest.setTimeout(15000);