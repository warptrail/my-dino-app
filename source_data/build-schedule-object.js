// build-festival-schedule.js
import fs from "node:fs";
import path from "node:path";
import dayjs from "dayjs";

function loadSchedule(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(raw);

  const stages = {};
  for (const s of data.schedule) {
    if (!stages[s.stage]) stages[s.stage] = [];
    stages[s.stage].push({
      artist: s.artist,
      start: dayjs(s.startISO).format("HH:mm"),
      end: dayjs(s.endISO).format("HH:mm"),
    });
  }

  // Sort sets per stage by start time
  for (const stage of Object.keys(stages)) {
    stages[stage].sort((a, b) => a.start.localeCompare(b.start));
  }

  return {
    day: data.meta.date ? dayjs(data.meta.date).format("dddd") : data.day,
    stages,
  };
}

const baseDir = "./"; // adjust if your .jsons are elsewhere
const days = [
  loadSchedule(path.join(baseDir, "friday.schedule.json")),
  loadSchedule(path.join(baseDir, "saturday.schedule.json")),
  loadSchedule(path.join(baseDir, "sunday.schedule.json")),
];

const out = { schedule: days };
fs.writeFileSync("all-days.schedule.json", JSON.stringify(out, null, 2));
console.log("Wrote all-days.schedule.json");