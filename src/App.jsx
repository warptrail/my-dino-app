import React, { useEffect, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import data from './data.json';

import ArtistBrowser from './components/ArtistBrowser';
import ArtistCount from './components/CountBox';
import InfoCard from './components/InfoCard';
import PackingList from './components/PackingList';
import Schedule from './components/Schedule';
import WeatherInfoCards from './components/WeatherInfoCars';

dayjs.extend(utc);
dayjs.extend(timezone);

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: 'Trebuchet MS', sans-serif;
    background: linear-gradient(to bottom, #1a1a1a, #2d2d2d);
    color: #f0f0f0;
  }
`;

const Wrapper = styled.div`
  padding: 1rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Countdown = styled.div`
  text-align: center;
  font-size: 1.4rem;
  font-weight: bold;
  color: #ffe100;
  margin: 1rem 0;
`;

const SectionTitle = styled.h2`
  color: #00ffcc;
  font-size: 1.4rem;
  border-bottom: 2px dashed #00ffcc;
  padding-bottom: 0.5rem;
  margin-top: 2rem;
`;

const ScrollWindow = styled.div`
  max-height: 280px;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
`;

const LineupList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const LineupItem = styled.li`
  padding: 0.3rem 0;
  border-bottom: 1px solid #333;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.07);
  border-left: 5px solid #00ffcc;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const CardTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #00ffcc;
`;

export default function App() {
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const targetDate = dayjs.tz('2025-09-19 14:00', 'America/New_York');

    const updateCountdown = () => {
      const now = dayjs();
      const diff = targetDate.diff(now, 'second');

      if (diff <= 0) {
        setCountdown('🦕 The gates to Lost Lands have opened! 🦖');
        return;
      }

      const days = Math.floor(diff / (60 * 60 * 24));
      const hours = Math.floor((diff % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((diff % (60 * 60)) / 60);
      const seconds = diff % 60;

      setCountdown(
        `${days}d ${hours}h ${minutes}m ${seconds}s until the Wub Volcano erupts!`
      );
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <GlobalStyle />
      <Wrapper>
        <h1>🦖 Dino Rave to Lost Lands 2025 🦕</h1>
        <Countdown>{countdown}</Countdown>

        <SectionTitle>Artist Lineup </SectionTitle>
        {/* <ScrollWindow> */}
        <ArtistBrowser schedule={data.schedule} />

        <ArtistCount schedule={data.schedule} />

        {/* </ScrollWindow> */}

        <SectionTitle>Festival Schedule </SectionTitle>
        <div>
          <Schedule schedule={data.schedule} />
        </div>

        <SectionTitle>Festival Info</SectionTitle>
        {data.info.map((card, i) => (
          <InfoCard key={i} data={card} />
        ))}

        <SectionTitle>Festival Info</SectionTitle>
        <WeatherInfoCards weather={data.weather} />

        <SectionTitle>
          Exploration of the Lost Lands Adventure's Checklist
        </SectionTitle>
        <PackingList items={data.items} />
      </Wrapper>
    </>
  );
}
