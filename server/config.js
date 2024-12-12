const fs = require('fs');

// Helper functions for file operations
function readJsonFile(filename) {
    try {
        const data = fs.readFileSync(filename, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return filename.includes('thoughts') ? [] : { connected_users: [], blocked_users: [] };
        }
        console.error(`Error reading ${filename}:`, error);
        return null;
    }
}

function writeJsonFile(filename, data) {
    try {
        fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error writing ${filename}:`, error);
    }
}


function isBlocked(ip) {
    const users = readJsonFile('users.json');
    return users.blocked_users.includes(ip);
}

function isUserBlocked(req, res, next){
  
}

function authenticateAdmin(req, res, next) {
  const token = req.body.key;
  if (token===process.env.ADMIN_SECRET_KEY) {
    next();
  }else{
    res.status(401).json({ error: 'Unauthorized' });
  }
}

// Add these exports at the end of the file
module.exports = {
    readJsonFile,
    writeJsonFile,
    isBlocked,
    isUserBlocked,
    authenticateAdmin
};