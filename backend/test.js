const db = require("./config/database"); db.query("DESCRIBE pgs").then(r => console.log(r[0])).catch(e => console.error(e)).finally(() => process.exit())
