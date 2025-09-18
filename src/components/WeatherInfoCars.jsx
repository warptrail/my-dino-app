import React from 'react';
import styled from 'styled-components';

const WeatherGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
  margin-bottom: 2rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const WeatherCard = styled.div`
  background: rgba(0, 0, 0, 0.5);
  border-left: 5px solid ${(props) => props.borderColor || '#00ffcc'};
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.1);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.75rem;
`;

const Icon = styled.span`
  font-size: 1.8rem;
`;

const DayTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
`;

const DetailRow = styled.div`
  margin: 0.35rem 0;
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
`;

const Label = styled.span`
  color: #bbb;
`;

const Value = styled.span`
  font-weight: 500;
`;

const Note = styled.p`
  font-size: 0.85rem;
  margin-top: 1rem;
  color: #ccc;
  font-style: italic;
`;

const WeatherInfoCards = () => {
  return (
    <WeatherGrid>
      <WeatherCard $borderColor="#FFD700">
        <Header>
          <Icon>🌤️</Icon>
          <DayTitle>Friday – Sep 19</DayTitle>
        </Header>
        <DetailRow>
          <Label>High / Low:</Label>
          <Value>87°F / 56°F</Value>
        </DetailRow>
        <DetailRow>
          <Label>Humidity (Day):</Label>
          <Value>55%</Value>
        </DetailRow>
        <DetailRow>
          <Label>Humidity (Night):</Label>
          <Value>75%</Value>
        </DetailRow>
        <DetailRow>
          <Label>Conditions:</Label>
          <Value>Partly Sunny</Value>
        </DetailRow>
        <Note>
          Warm and pleasant. Hydrate & wear sunscreen during peak sun hours.
        </Note>
      </WeatherCard>

      <WeatherCard $borderColor="#FF8C00">
        <Header>
          <Icon>☀️</Icon>
          <DayTitle>Saturday – Sep 20</DayTitle>
        </Header>
        <DetailRow>
          <Label>High / Low:</Label>
          <Value>87°F / 59°F</Value>
        </DetailRow>
        <DetailRow>
          <Label>Humidity (Day):</Label>
          <Value>55%</Value>
        </DetailRow>
        <DetailRow>
          <Label>Humidity (Night):</Label>
          <Value>78%</Value>
        </DetailRow>
        <DetailRow>
          <Label>Conditions:</Label>
          <Value>Mostly Sunny</Value>
        </DetailRow>
        <Note>
          Hot afternoon sun — expect dusty vibes. Chill nights, bring a light
          jacket.
        </Note>
      </WeatherCard>

      <WeatherCard $borderColor="#00BFFF">
        <Header>
          <Icon>⛈️</Icon>
          <DayTitle>Sunday – Sep 21</DayTitle>
        </Header>
        <DetailRow>
          <Label>High / Low:</Label>
          <Value>83°F / 62°F</Value>
        </DetailRow>
        <DetailRow>
          <Label>Humidity (Day):</Label>
          <Value>60%</Value>
        </DetailRow>
        <DetailRow>
          <Label>Humidity (Night):</Label>
          <Value>85%</Value>
        </DetailRow>
        <DetailRow>
          <Label>Conditions:</Label>
          <Value>Clouds & Thunderstorms</Value>
        </DetailRow>
        <Note>
          Scattered storms possible after 2pm. Bring a poncho or waterproof
          gear!
        </Note>
      </WeatherCard>
    </WeatherGrid>
  );
};

export default WeatherInfoCards;
