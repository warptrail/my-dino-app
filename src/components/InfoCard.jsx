import React from 'react';
import styled from 'styled-components';
import dayjs from 'dayjs';

const Card = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-left: 5px solid #00ffcc;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 2rem;
  box-shadow: 0 0 12px rgba(0, 255, 204, 0.15);
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 0 18px rgba(0, 255, 204, 0.3);
  }
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

const Icon = styled.span`
  font-size: 1.5rem;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.3rem;
  color: #00ffcc;
  text-shadow: 0 0 3px rgba(0, 255, 204, 0.7);
`;

const Subtitle = styled.div`
  font-size: 1rem;
  color: #aaa;
  margin-bottom: 0.5rem;
`;

const DateTime = styled.div`
  font-size: 0.95rem;
  color: #ffe100;
  margin-bottom: 0.5rem;
`;

const Content = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  margin: 0.75rem 0;
  color: #eee;
`;

const Meta = styled.div`
  font-size: 0.85rem;
  color: #bbb;
  margin-top: 1rem;
`;

const LinkList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0.75rem 0;
`;

const LinkItem = styled.li`
  margin-bottom: 0.4rem;

  a {
    text-decoration: none;
    color: #00ffcc;
    background: rgba(0, 255, 204, 0.1);
    padding: 0.35rem 0.65rem;
    border-radius: 6px;
    font-size: 0.9rem;
    display: inline-block;
    transition: all 0.3s ease;
    box-shadow: 0 0 4px rgba(0, 255, 204, 0.25);

    &:hover {
      background: #00ffcc;
      color: #000;
      box-shadow: 0 0 12px #00ffcc;
      transform: translateY(-1px);
    }
  }
`;

/** Helper formatters (no heavy logic—just nice strings) */
function formatRange({ start, end, datetime, duration }) {
  // Prefer new start/end. Fallback to legacy datetime + duration.
  if (start && end) {
    const s = dayjs(start);
    const e = dayjs(end);
    const sameDay = s.isSame(e, 'day');

    const startStr = s.format('ddd, MMM D, YYYY • h:mm A');
    const endStr = sameDay
      ? e.format('h:mm A')
      : e.format('ddd, MMM D • h:mm A');

    return `${startStr} → ${endStr}`;
  }

  if (datetime && duration) {
    const s = dayjs(datetime);
    const e = s.add(duration, 'minute');
    const sameDay = s.isSame(e, 'day');

    const startStr = s.format('ddd, MMM D, YYYY • h:mm A');
    const endStr = sameDay
      ? e.format('h:mm A')
      : e.format('ddd, MMM D • h:mm A');

    return `${startStr} → ${endStr}`;
  }

  if (datetime) {
    return dayjs(datetime).format('ddd, MMM D, YYYY • h:mm A');
  }

  return null;
}

export default function InfoCard({ data }) {
  const {
    title,
    subtitle,
    // NEW:
    start,
    end,
    // LEGACY (still supported as fallback):
    datetime,
    duration,

    icon,
    people,
    content,
    location,
    links,
    notes,
    status,
  } = data;

  const rangeText = formatRange({ start, end, datetime, duration });
  // inside your InfoCard component
  const startTime = data.start
    ? dayjs(data.start).format('ddd, MMM D • h:mm A')
    : null;

  const endTime = data.end
    ? dayjs(data.end).format('ddd, MMM D • h:mm A')
    : null;
  return (
    <Card>
      <TitleRow>
        {icon && <Icon>{icon}</Icon>}
        <Title>{title}</Title>
      </TitleRow>

      {subtitle && <Subtitle>{subtitle}</Subtitle>}

      {startTime && endTime && (
        <DateTime>
          {startTime} → {endTime}
        </DateTime>
      )}

      {content && <Content>{content}</Content>}

      {location &&
        (location.name ||
          location.address ||
          location.mapsLink ||
          location.appleMapsLink) && (
          <Meta>
            {location.name && <strong>📍 {location.name}</strong>}
            {location.name &&
              (location.address ||
                location.mapsLink ||
                location.appleMapsLink) && <br />}
            {location.address && (
              <>
                {location.address}
                <br />
              </>
            )}
            {location.mapsLink && (
              <>
                <a
                  href={location.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Maps
                </a>
                {location.appleMapsLink && ' | '}
              </>
            )}
            {location.appleMapsLink && (
              <a
                href={location.appleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Apple Maps
              </a>
            )}
          </Meta>
        )}

      {Array.isArray(people) && people.length > 0 && (
        <Meta>
          <strong>👥 People:</strong> {people.join(', ')}
        </Meta>
      )}

      {Array.isArray(links) && links.length > 0 && (
        <Meta>
          <strong>🔗 Links:</strong>
          <LinkList>
            {links.map((link, i) => (
              <LinkItem key={i}>
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
              </LinkItem>
            ))}
          </LinkList>
        </Meta>
      )}

      {notes && (
        <Meta>
          <strong>📝 Notes:</strong> {notes}
        </Meta>
      )}

      {status && (
        <Meta>
          <strong>📌 Status:</strong> {status}
        </Meta>
      )}
    </Card>
  );
}
