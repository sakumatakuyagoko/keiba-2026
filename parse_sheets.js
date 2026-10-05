const https = require('https');

function get(url, cb) {
  https.get(url, res => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      return get(res.headers.location, cb);
    }
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => cb(data));
  }).on('error', console.error);
}

get('https://docs.google.com/spreadsheets/d/1EOKUQLTzm1aRa7ArNIdVDfc7rCR0rnbulc5ipgU9CFM/htmlview', html => {
  // Regex to find sheets in htmlview
  const matches = [...html.matchAll(/name:\s*"([^"]+)",\s*pageUrl:[^,]+,\s*gid:\s*"([^"]+)"/g)];
  if (matches.length > 0) {
    matches.forEach(m => console.log(`Sheet: ${m[1]} (gid: ${m[2]})`));
  } else {
    // Alternative pattern
    const regex = /"name":"([^"]+)"[^}]*"sheetId":(\d+)/g;
    let m;
    while ((m = regex.exec(html)) !== null) {
      console.log(`Sheet: ${m[1]} (gid: ${m[2]})`);
    }
  }
});
