import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const Wrapper = styled.div`
  text-align: center;
  font-size: 1.4rem;
  font-weight: bold;
  color: #ffe100;
  margin: 1rem 0;
`;

const FinishedMessage = styled.div`
  color: #00ffcc;
`;

export default function Countdown({
  targetDate = '2025-09-19T14:00:00',
  timeZone = 'America/New_York',
}) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const target = dayjs.tz(targetDate, timeZone);

    const update = () => {
      const now = dayjs();
      const diff = target.diff(now, 'second');

      if (diff <= 0) {
        setRemaining(null);
        return;
      }

      const days = Math.floor(diff / (60 * 60 * 24));
      const hours = Math.floor((diff % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((diff % (60 * 60)) / 60);
      const seconds = diff % 60;

      setRemaining(
        `${days}d ${hours}h ${minutes}m ${seconds}s until the Wub Volcano erupts!`
      );
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [targetDate, timeZone]);

  return (
    <Wrapper>
      {remaining !== null ? (
        remaining
      ) : (
        <FinishedMessage>
          🦕 The gates to Lost Lands have opened! 🦖
        </FinishedMessage>
      )}
    </Wrapper>
  );
}
