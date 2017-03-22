module.exports = {
    "directory": __dirname,
    "logLocation": __dirname + "/logs/importantinformation.log",
    "mysql": {
        "host" : process.env.DATABASE_HOST || 'localhost',
        "user" : 'root',
        "password" : '1234',
        "database" : 'sketch-my-word',
        "port" : '3306'
    }
}