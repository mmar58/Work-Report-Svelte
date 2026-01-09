try {
    console.log("Checking dependencies...");
    require('express');
    console.log("express loaded");
    require('moment-timezone');
    console.log("moment-timezone loaded");
    console.log("All good check passed");
} catch (e) {
    console.error("Dependency check failed:", e);
}
