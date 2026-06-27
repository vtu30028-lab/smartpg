#!/usr/bin/env node
/** Run: node backend/scripts/setupDatabase.js */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { initDatabase } = require('../config/initDatabase');

initDatabase().then((ok) => {
  if (ok) {
    console.log('\nDatabase setup complete!');
    console.log('All register/login users will now be saved in MySQL.\n');
    process.exit(0);
  } else {
    console.log('\nSetup failed. Edit .env and set your MySQL password:\n');
    console.log('  DB_PASSWORD=your_mysql_password\n');
    process.exit(1);
  }
});
