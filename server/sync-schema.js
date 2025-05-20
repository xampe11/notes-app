const fs = require('fs');
const path = require('path');

// Paths to schema files
const sourceSchema = path.join(__dirname, 'models', 'schema.ts');
const targetSchema = path.join(__dirname, '..', 'shared', 'schema.ts');

// Read the source schema
const schemaContent = fs.readFileSync(sourceSchema, 'utf8');

// Write to the target schema
fs.writeFileSync(targetSchema, schemaContent);

console.log('Schema files synchronized successfully!');