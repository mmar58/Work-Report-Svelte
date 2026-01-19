
const demoStore = require("./DemoDataStore");
const moment = require("moment-timezone");

function setupDemoBackend(app) {
    const userTimeZone = "Asia/Dhaka";

    app.get("/", (req, res, next) => {
        // Only respond if the request specifically targets the demo root, 
        // but since this is attached to a main app, "/" might be taken.
        // The user said "add/serve... with another backend". 
        // If we hijack "/", it might break the main app. 
        // But for now, I will keep it as requested, maybe the user wants it.
        // Or I can add a specialized message? 
        // The previous code had `res.send("Hello, World! (Demo Mode)")`.
        // I will comment it out or make it specific to avoid conflict? 
        // User asked for "demo-backend api's", usually implying the functionality ones.
        // Ill keep it but maybe it will just overwrite or stack. Express executes in order.
        // If I append this *after* other routes, it might not be reached if others match.
        // Let's keep the logic simple.
        // res.send("Hello, World! (Demo Mode)");
        next();
    });

    // API to get work data based on date range
    app.get("/work-data", (req, res) => {
        let { startDate, endDate } = req.query;

        if (!startDate) {
            return res.status(400).json({ error: "Start date is required" });
        }

        const end = endDate || startDate;
        const results = demoStore.getDataRange(startDate, end);
        res.json(results);
    });

    // API Endpoint for specific dates (used by "fetchTodayWork")
    app.get("/worktime", (req, res) => {
        let datesParam = req.query.dates;
        if (!datesParam) {
            datesParam = moment().tz(userTimeZone).format("YYYY-MM-DD");
        }

        let dates = datesParam.split(",");
        let results = [];

        dates.forEach(date => {
            let m = moment(date, ["YYYY-MM-DD", "DD-MM-YYYY"]);
            if (m.isValid()) {
                const yyyymmdd = m.format("YYYY-MM-DD");
                const data = demoStore.getData(yyyymmdd);

                const responseData = { ...data };
                responseData.date = m.format("DD-MM-YYYY");
                results.push(responseData);
            }
        });

        res.json(results);
    });

    app.get("/hourlyRate", (req, res) => {
        res.json(50); // Mock rate
    });

    app.get("/getTargetHours", (req, res) => {
        res.json(40);
    });

    app.get("/setTargetHours", (req, res) => {
        res.json(parseInt(req.query.hours) || 40);
    });

    app.post("/update-extra-minutes", (req, res) => {
        const { date, minutes } = req.body;
        if (!date || minutes === undefined) {
            return res.status(400).json({ error: "Date and minutes are required" });
        }

        demoStore.updateExtraMinutes(date, minutes);
        res.json({ message: "Extra minutes updated successfully (Demo)" });
    });

    console.log("🚀 Demo Backend routes attached.");
}

module.exports = setupDemoBackend;

if (require.main === module) {
    const express = require("express");
    const cors = require("cors");
    const app = express();

    app.use(cors());
    app.use(express.json());

    setupDemoBackend(app);

    // Parse port from command line args or env
    const args = process.argv.slice(2);
    let port = process.env.PORT || 3000;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--port' && args[i + 1]) {
            port = parseInt(args[i + 1], 10);
            break;
        }
    }

    app.listen(port, () => {
        console.log(`Standalone Demo Backend running on http://localhost:${port}`);
        console.log(`Test URL: http://localhost:${port}/worktime`);
    });
}
