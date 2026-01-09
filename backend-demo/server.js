const express = require("express");
const cors = require("cors");
const http = require("http");
const demoStore = require("./DemoDataStore");
const moment = require("moment-timezone");

const app = express();
const server = http.createServer(app);
const port = 4401;

app.use(express.json());
app.use(cors({
    origin: (origin, callback) => {
        callback(null, true)
    }
}));

const userTimeZone = "Asia/Dhaka";

// Mock Video Gallery setup if needed to prevent errors if frontend calls it?
// Or just ignore. The request is specific to "showcase the work report".

app.get("/", (req, res) => {
    res.send("Hello, World! (Demo Mode)");
});

// API to get work data based on date range
app.get("/work-data", (req, res) => {
    let { startDate, endDate } = req.query;

    if (!startDate) {
        return res.status(400).json({ error: "Start date is required" });
    }

    // Generate/Get data for all days in range
    // Assume startDate and endDate are YYYY-MM-DD
    const end = endDate || startDate;
    const results = demoStore.getDataRange(startDate, end);
    res.json(results);
});

// API Endpoint for specific dates (used by "fetchTodayWork")
app.get("/worktime", (req, res) => {
    // dates param is comma separated, creates array
    // input format from frontend is sometimes DD-MM-YYYY or YYYY-MM-DD
    // My store expects YYYY-MM-DD normalization.

    let datesParam = req.query.dates;
    if (!datesParam) {
        datesParam = moment().tz(userTimeZone).format("YYYY-MM-DD");
    }

    let dates = datesParam.split(",");
    let results = [];

    dates.forEach(date => {
        // Need to ensure format is parsed correctly.
        // If frontend sends DD-MM-YYYY (e.g. 09-01-2026), moment needs to know.
        // Let's try flexible parsing.
        let m = moment(date, ["YYYY-MM-DD", "DD-MM-YYYY"]);
        if (m.isValid()) {
            const yyyymmdd = m.format("YYYY-MM-DD");
            const data = demoStore.getData(yyyymmdd);

            // The original backend returns date as DD-MM-YYYY sometimes in the `worktime` endpoint?
            // Let's enable returning DD-MM-YYYY if that's what frontend expects for matching.
            // Looking at frontend `workData.ts`:
            // `const [d, m, y] = item.date.split('-');` -> expects DD-MM-YYYY?
            // But my store returns YYYY-MM-DD in `getData`.

            // Let's clone and format date field for response to match old backend behavior if needed.
            // Old backend python script returns DD-MM-YYYY.
            // Let's modify the response object slightly.

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

server.listen(port, () => {
    console.log("🚀 Demo Server running on http://localhost:" + port);
});
