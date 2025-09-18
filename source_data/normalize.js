// normalize.js
// Usage:
//   node normalize.js ./source_data/Friday.csv 2025-09-19 [--debug]
//
// Produces JSON to stdout. Redirect to a file if you like:
//   node normalize.js ./source_data/Friday.csv 2025-09-19 > friday.schedule.json

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const csvPathArg = args[0];
const dateArg = args[1];
const debug = args.includes("--debug");

if (!csvPathArg || !dateArg) {
  console.error("Usage: node normalize.js <path/to/Friday.csv> <YYYY-MM-DD> [--debug]");
  process.exit(1);
}

// ---------- helpers ----------

function stripBOM(s) {
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

// CSV parser that handles quotes and commas within quotes.
// No support for CRLF inside a quoted field (rare for schedules).
function parseCSV(text) {
  text = text.replace(/\r\n/g, "\n");
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        const next = text[i + 1];
        if (next === '"') {
          field += '"'; // escaped quote
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(field.trim());
        field = "";
      } else if (ch === "\n") {
        row.push(field.trim());
        rows.push(row);
        row = [];
        field = "";
      } else {
        field += ch;
      }
    }
  }
  // last field
  if (field.length > 0 || inQuotes || row.length > 0) {
    row.push(field.trim());
    rows.push(row);
  }

  // trim trailing fully-empty rows
  while (rows.length && rows[rows.length - 1].every((c) => (c ?? "").trim() === "")) {
    rows.pop();
  }
  return rows;
}

// Reliable TZ conversion (handles EDT/EST)
function toISO(dateStr, hour, minute, tz = "America/New_York") {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) throw new Error(`Bad dateStr: ${dateStr}`);

  // Guess UTC for the intended local wall time
  const guess = Date.UTC(y, m - 1, d, hour, minute, 0);

  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    timeZoneName: "shortOffset",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const formatted = dtf.format(new Date(guess));
  const match = formatted.match(/GMT([+-]\d{1,2})(?::(\d{2}))?/);
  if (!match) throw new Error(`Could not parse timezone offset from "${formatted}"`);

  const sign = match[1].startsWith("-") ? -1 : 1;
  const hours = Math.abs(parseInt(match[1], 10));
  const mins = match[2] ? parseInt(match[2], 10) : 0;
  const offsetMinutes = sign * (hours * 60 + mins);

  // UTC = local - offset
  const utcMs = Date.UTC(y, m - 1, d, hour, minute, 0) - offsetMinutes * 60_000;
  return new Date(utcMs).toISOString();
}

function reconstructSchedule({
  csvRows,
  dateStr,                 // "2025-09-19" Friday
  startHour = 13,          // 1 PM
  startMinute = 0,
  slotMinutes = 15,
  tz = "America/New_York",
  ignoredHeaders = [],     // add any non-stage headers if needed
}) {
  if (csvRows.length < 1) throw new Error("CSV appears empty");

  // Use first non-empty row as header
  let headerRowIdx = 0;
  while (
    headerRowIdx < csvRows.length &&
    csvRows[headerRowIdx].every((c) => (c ?? "").trim() === "")
  ) {
    headerRowIdx++;
  }
  if (headerRowIdx >= csvRows.length) throw new Error("No header row found");

  const headers = csvRows[headerRowIdx].map((h) => (h ?? "").trim());
  const dataRows = csvRows.slice(headerRowIdx + 1);

  // normalize row lengths
  const width = Math.max(...csvRows.map((r) => r.length));
  const norm = (r) => {
    const out = r.slice();
    while (out.length < width) out.push("");
    return out.map((x) => (x ?? "").trim());
  };
  const rows = dataRows.map(norm);

  // detect stage columns (non-ignored, non-empty header)
  const stageCols = headers
    .map((name, idx) => ({ name: name.trim(), idx }))
    .filter(
      (h) => h.name.length > 0 && !ignoredHeaders.includes(h.name)
    );

  // if every header was empty, assume all columns are stages
  const effectiveStageCols = stageCols.length ? stageCols : headers.map((name, idx) => ({ name: name || `Stage ${idx+1}`, idx }));

  // build row time index
  // NOTE: we DO NOT drop completely blank rows here; they still carry time advancement
  const rowTimes = rows.map((_, r) => {
    const minutesFromTop = r * slotMinutes;
    const totalMinutes = startHour * 60 + startMinute + minutesFromTop;
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    const iso = toISO(dateStr, hour, minute, tz);
    return { row: r, hour, minute, iso, local: `${hour}:${String(minute).padStart(2, "0")}` };
  });

  const sets = [];
  for (const stage of effectiveStageCols) {
    let currentArtist = null;
    let startRow = null;

    for (let r = 0; r < rows.length; r++) {
      const cell = (rows[r][stage.idx] || "").trim();
      const isFilled = cell.length > 0;

      if (isFilled) {
        const artist = cell;
        if (currentArtist === null) {
          currentArtist = artist;
          startRow = r;
        } else if (artist !== currentArtist) {
          // close previous block
          const endRowExclusive = r;
          sets.push({
            stage: stage.name,
            artist: currentArtist,
            startISO: rowTimes[startRow].iso,
            endISO:
              endRowExclusive < rowTimes.length
                ? rowTimes[endRowExclusive].iso
                : toISO(dateStr, 23, 59, tz),
          });
          // start new block
          currentArtist = artist;
          startRow = r;
        }
      } else {
        // empty => close if we had an open block
        if (currentArtist !== null) {
          const endRowExclusive = r;
          sets.push({
            stage: stage.name,
            artist: currentArtist,
            startISO: rowTimes[startRow].iso,
            endISO:
              endRowExclusive < rowTimes.length
                ? rowTimes[endRowExclusive].iso
                : toISO(dateStr, 23, 59, tz),
          });
          currentArtist = null;
          startRow = null;
        }
      }
    }

    // close trailing block
    if (currentArtist !== null) {
      const endRowExclusive = rows.length;
      sets.push({
        stage: stage.name,
        artist: currentArtist,
        startISO: rowTimes[startRow].iso,
        endISO:
          endRowExclusive < rowTimes.length
            ? rowTimes[endRowExclusive].iso
            : toISO(dateStr, 23, 59, tz),
      });
    }
  }

  // sort by start
  sets.sort((a, b) => a.startISO.localeCompare(b.startISO));

  return { headers, stages: effectiveStageCols.map((s) => s.name), rowTimes, sets };
}

// ---------- run ----------

const csvPath = path.resolve(csvPathArg);
const raw = stripBOM(fs.readFileSync(csvPath, "utf8"));
const csv = parseCSV(raw);

const { headers, stages, rowTimes, sets } = reconstructSchedule({
  csvRows: csv,
  dateStr: dateArg,
  startHour: 13,      // 1pm
  startMinute: 0,
  slotMinutes: 15,
  tz: "America/New_York",
  ignoredHeaders: [], // add non-stage headers here if any
});

// Always emit JSON so redirection never creates an empty file.
const out = {
  day: "Friday",
  meta: {
    source: path.basename(csvPath),
    date: dateArg,
    startLocal: "13:00",
    slotMinutes: 15,
    headers,
    stages,
    rowCount: rowTimes.length,
    setCount: sets.length,
  },
  schedule: sets,
};

if (debug) {
  console.error(`[normalize] headers: ${JSON.stringify(headers)}`);
  console.error(`[normalize] stages: ${JSON.stringify(stages)}`);
  console.error(`[normalize] rows: ${rowTimes.length}, sets: ${sets.length}`);
  if (rowTimes.length) {
    console.error(`[normalize] first 5 times: ${rowTimes.slice(0,5).map(t=>t.local).join(", ")}`);
  }
}

console.log(JSON.stringify(out, null, 2));