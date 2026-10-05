const https = require('https');
const fs = require('fs');

function fetchSheet(gid, filename) {
  const url = `https://docs.google.com/spreadsheets/d/1EOKUQLTzm1aRa7ArNIdVDfc7rCR0rnbulc5ipgU9CFM/export?format=csv&gid=${gid}`;
  
  function get(u) {
    https.get(u, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return get(res.headers.location);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        fs.writeFileSync(filename, data);
        console.log(`Saved ${filename} (${data.length} bytes)`);
      });
    }).on('error', console.error);
  }
  get(url);
}

fetchSheet(0, 'sheet_INDEX.csv');
fetchSheet(1388780425, 'sheet_2025.csv');
fetchSheet(1443511971, 'sheet_2024.csv');
fetchSheet(1139753735, 'sheet_2023.csv');
