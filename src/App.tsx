import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { ATTRIBUTE_LIST, CLASS_LIST, SKILL_LIST } from './consts';
import { Attributes, Class } from './types';

const getModifier = (ability: number) => {
  return Math.floor((ability - 10) / 2)
}

type CharacterData = {
  id: number;
  attributes: Attributes;
  openClassRequirements: Class | null;
  pointsSpent: { [x: string]: number };
}

const initialCharacterData: CharacterData = {
  id: 0,
  attributes: {
    'Strength': 0,
    'Dexterity': 0,
    'Constitution': 0,
    'Intelligence': 0,
    'Wisdom': 0,
    'Charisma': 0,
  },
  openClassRequirements: null,
  pointsSpent: {},
}

function App() {
  const [characterData, setCharacterData] = useState<CharacterData[]>([]);

  useEffect(() => {
    const fetcher = async () => {
      const data = await fetch('https://recruiting.verylongdomaintotestwith.ca/api/{mytscu}/character');
      const characterData = await data.json();
      console.log('characterData', characterData);
      setCharacterData(characterData.body);
    };
    fetcher();
  }, []);

  const onSave = useCallback(async () => {
    const response = await fetch('https://recruiting.verylongdomaintotestwith.ca/api/{mytscu}/character', {
      method: 'POST',
      body: JSON.stringify(characterData),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log(response)
  }, [characterData]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>React Coding Exercise</h1>
      </header>
      <button onClick={() => setCharacterData(characterData => [...characterData, { ...initialCharacterData, id: characterData.length + 1 }])}>Add Character</button>
      <button onClick={onSave}>Save</button>
      {characterData.map((data, idx) => <div key={idx}>
        <h2>Character {data.id}</h2>
        <section className="App-section">
          {ATTRIBUTE_LIST.map((attribute, idx) =>
            <div key={idx}>
              <button onClick={() => {
                if (Object.values(data.attributes).reduce((sum, attribute) => sum + attribute, 0) >= 70) {
                  window.alert('Maximum of 70 across all attributes')
                  return;
                }
                setCharacterData(cds => cds.map(cd => cd.id === data.id ? ({ ...cd, attributes: { ...cd.attributes, [attribute]: cd.attributes[attribute] + 1 } }) : cd));
              }}>
                Increase
              </button>
              <button onClick={() => setCharacterData(cds => cds.map(cd => cd.id === data.id ? ({ ...cd, attributes: { ...cd.attributes, [attribute]: cd.attributes[attribute] - 1 } }) : cd))}>
                Decrease
              </button>
              <span>{attribute}: {data.attributes[attribute]} (Modifier: {getModifier(data.attributes[attribute])})</span>
            </div>
          )}
        </section>
        <section className="App-section">
          {Object.keys(CLASS_LIST).map((className: Class, idx) =>
            <div key={idx}>
              <p
                style={Object.keys(CLASS_LIST[className]).every(attr => CLASS_LIST[className][attr] <= data.attributes[attr]) ? { color: 'red' } : {}}
                onClick={() => setCharacterData(cds => cds.map(cd => cd.id === data.id ? ({ ...cd, openClassRequirements: className}) : cd))}
              >
                {className}
              </p>
              {className === data.openClassRequirements
                && <div>
                  {Object.keys(CLASS_LIST[className]).map(attr => <p>{attr}: {CLASS_LIST[className][attr]}</p>)}
                  <button onClick={() => setCharacterData(cds => cds.map(cd => cd.id === data.id ? ({ ...cd, openClassRequirements: undefined}) : cd))}>Close requirement view</button>
                </div>
              }
            </div>
          )}
        </section>
        <section className="App-section">
          <p>Skills</p>
          <p>Total skill points available: {Math.max(0, 10 + 4 * getModifier(data.attributes['Intelligence']))}</p>
          {SKILL_LIST.map((skill, idx) => <div key={idx}>
            {skill.name} - points: {data.pointsSpent[skill.name] ?? 0}
            <button style={{ display: 'inline' }} onClick={() => setCharacterData(cds => cds.map(cd => cd.id === data.id ? ({ ...cd, pointsSpent: { ...cd.pointsSpent, [skill.name]: (cd.pointsSpent[skill.name] ?? 0) + 1 } }) : cd))}>[+]</button>
            <button style={{ display: 'inline' }}  onClick={() => setCharacterData(cds => cds.map(cd => cd.id === data.id ? ({ ...cd, pointsSpent: { ...cd.pointsSpent, [skill.name]: (cd.pointsSpent[skill.name] ?? 0) - 1 } }) : cd))}>[-]</button>
            modifier ({skill.attributeModifier.slice(0, 3)}): {getModifier(data.attributes[skill.attributeModifier])}
            total: {(data.pointsSpent[skill.name] ?? 0) + getModifier(data.attributes[skill.attributeModifier])}
          </div>)}
        </section>
      </div>)}
    </div>
  );
}

export default App;
