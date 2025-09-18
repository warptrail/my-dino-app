import React, { useMemo, useState } from 'react';
import styled from 'styled-components';

/**
 * schedule shape:
 * [
 *   {
 *     day: "Friday" | "Saturday" | "Sunday",
 *     stages: {
 *       [stageName: string]: Array<{ artist: string, start: string, end: string }>
 *     }
 *   },
 *   ...
 * ]
 */

const DAY_ORDER = ['Friday', 'Saturday', 'Sunday'];

// Day colors (accessible-ish on dark)
const DAY_COLORS = {
  Friday: { bg: 'rgba(0,255,204,0.10)', edge: '#00e6b8', chip: '#0eeacb' },
  Saturday: { bg: 'rgba(255,196,0,0.10)', edge: '#ffb300', chip: '#ffc107' },
  Sunday: { bg: 'rgba(173,128,255,0.10)', edge: '#a77cff', chip: '#b68aff' },
};

// Optionally define known stage colors; fallback generator will handle the rest
const STAGE_COLORS = {
  'Prehistoric Stage': '#7dd3fc',
  'Wompy Woods': '#fca5a5',
  'Subsidia Stage': '#f9a8d4',
  'The Village Marketplace': '#fde68a',
  'Main Stage': '#a7f3d0',
  'Cave of Souls': '#c4b5fd',
};

// Fallback stage color from string (stable pastel)
const hashToHsl = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return `hsl(${h % 360} 70% 70%)`;
};

// Festival minutes helper (2pm->4am window)
const toFestivalMinutes = (hhmm) => {
  if (!hhmm) return Number.MAX_SAFE_INTEGER;
  const [hStr, mStr] = hhmm.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const hour24 = h < 4 ? h + 24 : h; // after midnight bucket
  const base = 14 * 60; // 2pm
  return hour24 * 60 + m - base;
};

const flattenSchedule = (schedule) => {
  const rows = [];
  for (const dayObj of schedule || []) {
    const day = dayObj.day;
    const stages = dayObj.stages || {};
    for (const stageName of Object.keys(stages)) {
      for (const slot of stages[stageName] || []) {
        rows.push({
          artist: slot.artist,
          stage: stageName,
          start: slot.start,
          end: slot.end,
          day,
        });
      }
    }
  }
  return rows;
};

const byAlpha = (a, b) =>
  a.artist.localeCompare(b.artist, undefined, { sensitivity: 'base' });

const byDayThenTime = (a, b) => {
  const d = DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day);
  if (d !== 0) return d;
  const t = toFestivalMinutes(a.start) - toFestivalMinutes(b.start);
  if (t !== 0) return t;
  return byAlpha(a, b);
};

const sorters = {
  alpha: byAlpha,
  stage: (a, b) => {
    const s = a.stage.localeCompare(b.stage, undefined, {
      sensitivity: 'base',
    });
    if (s !== 0) return s;
    return byDayThenTime(a, b); // secondary Day, tertiary Time (then alpha)
  },
  time: byDayThenTime,
};

// 12 deterministic fun emojis (dinosaurs + fest vibes)
const ARTIST_EMOJIS = [
  '🦖',
  '🦕',
  '🦴',
  '🗿',
  '🌋',
  '🌴',
  '🦎',
  '🦬',
  '✨',
  '🔥',
  '🌙',
  '🔊',
];
const pickEmojiForArtist = (name) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 33 + name.charCodeAt(i)) >>> 0;
  return ARTIST_EMOJIS[h % ARTIST_EMOJIS.length];
};

const Wrapper = styled.div`
  display: grid;
  gap: 12px;
`;

const Controls = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  --accent: #15f4b8;
  background: ${({ $active }) =>
    $active ? 'var(--accent)' : 'rgba(255,255,255,0.07)'};
  color: ${({ $active }) => ($active ? '#01231b' : '#e8fffb')};
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 12px;
  padding: 10px 12px;
  font-weight: 700;
  letter-spacing: 0.2px;
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 160ms ease, background 160ms ease;
  box-shadow: ${({ $active }) =>
    $active
      ? '0 6px 14px rgba(21,244,184,0.25)'
      : '0 2px 8px rgba(0,0,0,0.15)'};
  &:hover {
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(0);
  }
`;

const Legend = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  opacity: 0.9;
  font-size: 0.86rem;
`;

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 999px;
  background: ${({ $bg }) => $bg || 'rgba(255,255,255,0.06)'};
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-weight: 600;
  white-space: nowrap;
`;

const Dot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: ${({ $color }) => $color};
`;

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 6px;
`;

const Row = styled.li`
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    'artist time'
    'meta   meta';
  align-items: center;
  gap: 2px 8px;

  padding: 10px 12px;
  border-radius: 14px;

  background: radial-gradient(
      120% 140% at 0% 0%,
      rgba(255, 255, 255, 0.05),
      transparent 45%
    ),
    linear-gradient(0deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.03));
  outline: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.2);

  /* day-tinted edge & bg via transient props */
  border-left: 6px solid
    ${({ $dayEdge }) => $dayEdge || 'rgba(255,255,255,0.2)'};
  background-color: ${({ $dayBg }) => $dayBg || 'transparent'};

  @media (min-width: 640px) {
    grid-template-columns: 1.3fr 0.9fr auto;
    grid-template-areas: 'artist meta time';
    gap: 8px 12px;
    padding: 12px 14px;
  }
`;

const Artist = styled.div`
  grid-area: artist;
  font-weight: 900;
  letter-spacing: 0.2px;
  font-size: 1.02rem;
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const Emoji = styled.span`
  font-size: 1.05rem;
  opacity: 0.95;
  transform: translateY(1px);
`;

const Meta = styled.div`
  grid-area: meta;
  font-size: 0.88rem;
  opacity: 0.95;
  display: inline-flex;
  align-items: center;
  gap: 10px;
`;

const Time = styled.div`
  grid-area: time;
  font-variant-numeric: tabular-nums;
  font-weight: 800;
  font-size: 0.95rem;
  text-align: right;
`;

export default function ArtistBrowser({ schedule }) {
  const [mode, setMode] = useState('alpha'); // 'alpha' | 'stage' | 'time'

  const rows = useMemo(() => {
    const flat = flattenSchedule(schedule);
    const copy = [...flat];
    copy.sort(sorters[mode] || sorters.alpha);
    return copy;
  }, [schedule, mode]);

  // Time convert helper function
  const toAmPm = (hhmm) => {
    if (!hhmm) return '';
    let [h, m] = hhmm.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12; // 0 → 12, 13 → 1, etc.
    return `${h}:${m.toString().padStart(2, '0')} ${suffix}`;
  };

  return (
    <Wrapper>
      <Controls>
        <Button $active={mode === 'alpha'} onClick={() => setMode('alpha')}>
          Sort A–Z
        </Button>
        <Button $active={mode === 'stage'} onClick={() => setMode('stage')}>
          By Stage
        </Button>
        <Button $active={mode === 'time'} onClick={() => setMode('time')}>
          By Day & Time
        </Button>
      </Controls>

      <Legend>
        <Chip $bg="rgba(0,255,204,0.12)">⏱️ 2pm → 4am window</Chip>
        <Chip $bg="rgba(255,255,255,0.08)">🦖 Emojis are per-artist</Chip>
      </Legend>

      <List>
        {rows.map((r, idx) => {
          const dayColors = DAY_COLORS[r.day] || DAY_COLORS.Friday;
          const stageColor = STAGE_COLORS[r.stage] || hashToHsl(r.stage);
          const artistEmoji = pickEmojiForArtist(r.artist);

          return (
            <Row
              key={`${r.day}-${r.stage}-${r.artist}-${r.start}-${idx}`}
              $dayEdge={dayColors.edge}
              $dayBg={dayColors.bg}
            >
              <Artist>
                <Emoji aria-hidden>{artistEmoji}</Emoji>
                {r.artist}
              </Artist>

              <Meta>
                <Chip>{r.day}</Chip>
                <Chip $bg={`${stageColor}33`}>
                  <Dot $color={stageColor} />
                  {r.stage}
                </Chip>
              </Meta>

              <Time>
                {toAmPm(r.start)}–{toAmPm(r.end)}
              </Time>
            </Row>
          );
        })}
      </List>
    </Wrapper>
  );
}
