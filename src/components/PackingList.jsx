import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const STORAGE_KEY = 'packingListCheckedItems';

const Section = styled.section`
  margin-top: 2rem;
`;

const Title = styled.h2`
  color: #00ffcc;
  font-size: 1.4rem;
  border-bottom: 2px dashed #00ffcc;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
`;

const CategoryTitle = styled.h3`
  font-size: 1.1rem;
  color: #ffe100;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
`;

const ListItem = styled.li`
  margin-bottom: 0.6rem;
  display: flex;
  align-items: center;
`;

const Checkbox = styled.input`
  margin-right: 0.75rem;
  transform: scale(1.2);
`;

const Label = styled.label`
  font-size: 1rem;
  color: ${({ checked }) => (checked ? '#666' : '#f0f0f0')};
  text-decoration: ${({ checked }) => (checked ? 'line-through' : 'none')};
`;

export default function PackingList({ items }) {
  const [checkedKeys, setCheckedKeys] = useState([]);

  // Load from localStorage on first render
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCheckedKeys(parsed);
        }
      } catch (err) {
        console.warn('Failed to parse packing list state:', err);
      }
    }
  }, []);

  // Save to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedKeys));
  }, [checkedKeys]);

  const toggle = (key) => {
    setCheckedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const getItemKey = (category, item) => `${category}:${item}`;

  return (
    <Section>
      <Title>🧳 Packing List</Title>
      {items.map((group, i) => (
        <div key={i}>
          <CategoryTitle>{group.category}</CategoryTitle>
          <List>
            {group.items.map((item, j) => {
              const key = getItemKey(group.category, item);
              const isChecked = checkedKeys.includes(key);
              return (
                <ListItem key={key}>
                  <Checkbox
                    type="checkbox"
                    id={key}
                    checked={isChecked}
                    onChange={() => toggle(key)}
                  />
                  <Label htmlFor={key} checked={isChecked}>
                    {item}
                  </Label>
                </ListItem>
              );
            })}
          </List>
        </div>
      ))}
    </Section>
  );
}
