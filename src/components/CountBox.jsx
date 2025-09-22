import React, { useMemo } from 'react';
import styled from 'styled-components';

// simple wrapper
const CountBox = styled.div`
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-weight: 700;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const Dino = styled.span`
  font-size: 1.2rem;
`;

export default function ArtistCount({ schedule }) {
  const uniqueCount = useMemo(() => {
    const set = new Set();
    for (const dayObj of schedule || []) {
      for (const stageName of Object.keys(dayObj.stages || {})) {
        for (const slot of dayObj.stages[stageName] || []) {
          set.add(slot.artist.trim());
        }
      }
    }
    return set.size;
  }, [schedule]);

  return (
    <CountBox>
      <Dino>🦕</Dino>
      {uniqueCount} unique artists
      <Dino>🦖</Dino>
    </CountBox>
  );
}
