const fs = require('fs');

// File destination.txt will be created or overwritten by default.
fs.copyFile('.htaccess', 'build/.htaccess', (err) => {
  if (err) throw err;
  console.log('htaccess was copied to destination');
});