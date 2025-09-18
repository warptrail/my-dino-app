import styled from 'styled-components';

const ScheduleWrapper = styled.div`
  margin-top: 2rem;
`;

const DaySection = styled.div`
  margin-bottom: 2rem;
`;

const DayTitle = styled.h2`
  color: #ffe100;
  font-size: 1.2rem;
  border-bottom: 1px dashed #ffe100;
  padding-bottom: 0.25rem;
  margin-bottom: 0.5rem;
`;

const StageBlock = styled.div`
  margin-top: 1rem;
`;

const StageTitle = styled.h3`
  color: #00ffcc;
  font-size: 1rem;
  margin-bottom: 0.4rem;
`;

const ArtistList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ArtistItem = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 0.3rem 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 0.85rem;
  line-height: 1.1;
`;

const TimeRange = styled.span`
  color: #ccc;
  width: 30%;
  text-align: left;
  white-space: nowrap;
`;

const ArtistName = styled.span`
  color: #fff;
  width: 65%;
  text-align: right;
  font-weight: 500;
`;

export default function Schedule({ schedule }) {
  function formatTimeString(time) {
    const [hour, minute] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hour);
    date.setMinutes(minute);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  if (!Array.isArray(schedule)) {
    return <div>⚠️ Schedule data is missing or malformed</div>;
  }

  return (
    <ScheduleWrapper>
      {schedule.map(({ day, stages }, index) => {
        if (!stages || typeof stages !== 'object') {
          return <div key={index}>⚠️ Malformed schedule for {day}</div>;
        }

        return (
          <DaySection key={index}>
            <DayTitle>{day}</DayTitle>
            {Object.entries(stages).map(([stageName, sets]) => (
              <StageBlock key={stageName}>
                <StageTitle>{stageName}</StageTitle>
                {Array.isArray(sets) ? (
                  <ArtistList>
                    {sets.map(({ artist, start, end }, i) => (
                      <ArtistItem key={i}>
                        <TimeRange>
                          {start} – {end}
                        </TimeRange>
                        <ArtistName>{artist}</ArtistName>
                      </ArtistItem>
                    ))}
                  </ArtistList>
                ) : (
                  <div>⚠️ No sets for {stageName}</div>
                )}
              </StageBlock>
            ))}
          </DaySection>
        );
      })}
    </ScheduleWrapper>
  );
}
