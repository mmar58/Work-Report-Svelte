const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');

const DB_FILE = path.join(__dirname, 'demo_db.json');
const EXPIRATION_MS = 4 * 60 * 60 * 1000; // 4 hours

class DemoDataStore {
    constructor() {
        this.data = {};
        this.lastAccess = Date.now();
        this.load();
    }

    load() {
        try {
            if (fs.existsSync(DB_FILE)) {

                const fileContent = fs.readFileSync(DB_FILE, 'utf8');
                const parsed = JSON.parse(fileContent);
                this.data = parsed.data || {};
                this.lastAccess = parsed.lastAccess || Date.now();
                this.checkExpiration();
            } else {
                console.log("No existing DB file, starting fresh.");
            }
        } catch (err) {
            console.error("Error loading demo db:", err);
            this.data = {};
            this.lastAccess = Date.now();
        }
    }

    save() {
        try {
            fs.writeFileSync(DB_FILE, JSON.stringify({
                lastAccess: this.lastAccess,
                data: this.data
            }, null, 2));
        } catch (err) {
            console.error("Error saving demo db:", err);
        }
    }

    checkExpiration() {
        if (Date.now() - this.lastAccess > EXPIRATION_MS) {
            console.log("Demo data expired, clearing...");
            this.data = {};
            this.lastAccess = Date.now();
            return true;
        }
        return false;
    }

    updateAccess() {
        this.lastAccess = Date.now();
    }

    getDataRange(startDateStr, endDateStr) {
        // Check expiration once at the start of transaction
        if (this.checkExpiration()) {
            // Data was cleared.
        }

        const results = [];
        let current = moment(startDateStr, "YYYY-MM-DD");
        let end = moment(endDateStr, "YYYY-MM-DD");

        let changed = false;

        while (current.isSameOrBefore(end)) {
            const dateKey = current.format("YYYY-MM-DD");

            if (!this.data[dateKey]) {
                this.data[dateKey] = this.generateData(dateKey);
                changed = true;
            }
            results.push(this.data[dateKey]);
            current.add(1, 'days');
        }

        this.updateAccess();
        this.save(); // Save once per batch

        return results;
    }

    getData(dateStr) {
        return this.getDataRange(dateStr, dateStr)[0];
    }

    // Normalize date key to YYYY-MM-DD
    formatDateKey(dateInput) {
        // Input might be YYYY-MM-DD or DD-MM-YYYY or Date object?
        // Let's assume input matches what server receives.
        // But let's strictly store as YYYY-MM-DD.
        // The server calls often send YYYY-MM-DD or DD-MM-YYYY (from python script logic or frontend).
        // Let's enforce YYYY-MM-DD for storage.

        let d = moment(dateInput, ["YYYY-MM-DD", "DD-MM-YYYY"]);
        return d.format("YYYY-MM-DD");
    }

    generateData(dateStr) {
        // Generate realistic data
        // Start time: 09:00 - 10:00
        const startHour = 9 + Math.random();
        // End time: 17:00 - 19:00
        const endHour = 17 + Math.random() * 2;

        let currentSeconds = startHour * 3600;
        const endSeconds = endHour * 3600;

        const detailedWork = [];
        let totalWorkedSeconds = 0;

        // Convert seconds to HH:MM:SS string
        const toTimeStr = (secs) => {
            const h = Math.floor(secs / 3600);
            const m = Math.floor((secs % 3600) / 60);
            const s = Math.floor(secs % 60);
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        };

        let isWorking = true;
        let blockStart = currentSeconds;

        // Loop in chunks until end time
        while (currentSeconds < endSeconds) {
            // Work block: 20 mins to 90 mins
            // Break block: 5 mins to 30 mins

            let duration = 0;
            if (isWorking) {
                duration = (20 + Math.random() * 70) * 60;
                if (currentSeconds + duration > endSeconds) duration = endSeconds - currentSeconds;

                // Record work
                detailedWork.push({
                    startTime: toTimeStr(blockStart),
                    endTime: toTimeStr(blockStart + duration),
                    duration: toTimeStr(duration) // The scraper detailedWork uses formatted string duration?
                    // Analyzing scraper.js: `addTotalWorkTimeNote(startTimeText, time, convertSecondsToTimeText(temptime - startTime));`
                    // Yes, strings.
                });
                totalWorkedSeconds += duration;
            } else {
                // Break
                duration = (5 + Math.random() * 25) * 60;
                if (currentSeconds + duration > endSeconds) duration = endSeconds - currentSeconds;
            }

            currentSeconds += duration;
            blockStart = currentSeconds;
            isWorking = !isWorking;
        }

        const hours = Math.floor(totalWorkedSeconds / 3600);
        const minutes = Math.floor((totalWorkedSeconds % 3600) / 60);
        const seconds = Math.floor(totalWorkedSeconds % 60);

        return {
            date: dateStr, // YYYY-MM-DD
            hours,
            minutes,
            seconds,
            detailedWork: JSON.stringify(detailedWork),
            extraminutes: 0
        };
    }

    updateExtraMinutes(dateStr, minutes) {
        this.checkExpiration();
        const key = this.formatDateKey(dateStr);
        if (!this.data[key]) {
            // If trying to update non-existent, check if we should generate?
            // Or just create entry with 0 work?
            this.data[key] = {
                date: key,
                hours: 0,
                minutes: 0,
                seconds: 0,
                detailedWork: "[]",
                extraminutes: 0
            };
        }
        this.data[key].extraminutes = minutes;
        this.updateAccess();
        this.save();
        return minutes;
    }
}

module.exports = new DemoDataStore();
