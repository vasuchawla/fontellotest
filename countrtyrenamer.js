const fs = require('fs');
const path = require('path');

// Load the JSON file
const countries = require('./countries.json');

// Define the folder containing flag images
const folderPath = path.join(__dirname, 'flags');

countries.forEach((country) => {
    const oldFileName = path.join(folderPath, `${country.name}.png`);
    const newFileName = path.join(folderPath, `${country.code}.png`);

    if (fs.existsSync(oldFileName)) {
        fs.rename(oldFileName, newFileName, (err) => {
            if (err) {
                console.error(`Error renaming ${oldFileName}:`, err);
            } else {
                console.log(`Renamed: ${oldFileName} → ${newFileName}`);
            }
        });
    } else {
        console.warn(`File not found: ${oldFileName}`);
    }
});
