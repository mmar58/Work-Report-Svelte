module.exports = {
    apps: [
        {
            name: "work-report-demo",
            script: "backend-demo/server.js",
            watch: false,
            env: {
                NODE_ENV: "development",
                PORT: 4401
            }
        }
    ]
}