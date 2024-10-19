import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { ATTRIBUTE_LIST, CLASS_LIST, SKILL_LIST } from './consts';
import { Attributes, Class } from './types';

const getModifier = (ability: number) => {
  return Math.floor((ability - 10) / 2)
}

const getSkillTotal = (pointsSpent: number, ability: number) => {
  return pointsSpent + ability;
}

type CharacterData = {
  id: number;
  attributes: Attributes;
  openClassRequirements: Class | null;
  pointsSpent: { [x: string]: number };
  skillCheck: {
    skill: string;
    dc: number;
    roll?: number;
  };
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
  skillCheck: {
    skill: 'Acrobatics',
    dc: 0,
  }
}

function App() {
  const [characterData, setCharacterData] = useState<CharacterData[]>([]);
  const [partySkillCheck, setPartySkillCheck] = useState<{ skill: string, dc: number, results?: { roll: number, character: CharacterData } }>({ skill: 'Acrobatics', dc: 0 });

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
      body: JSON.stringify(characterData.map(cd => ({ ...cd, skillCheck: { ...cd.skillCheck, roll: undefined } }))),
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
      <section className="App-section">
        <p>Party Skill Check</p>
        <div>
          <span>Skill:</span>
          <select value={partySkillCheck.skill} onChange={e => setPartySkillCheck(partySkillCheck => ({ ...partySkillCheck, skill: e.target.value }))}>
            {SKILL_LIST.map((skill, idx) => <option key={idx} value={skill.name}>{skill.name}</option>)}
          </select>
          <span>DC:</span>
          <input type='number' value={partySkillCheck.dc} onChange={e => setPartySkillCheck(partySkillCheck => ({ ...partySkillCheck, dc: parseInt(e.target.value) }))} />
          <button onClick={() => {
            const random = Math.random();
            const randomInt = Math.floor(random * 20) + 1;
            let highestScoringCharacter: CharacterData;
            let highestScore = -Infinity;
            for (const character of characterData) {
              const characterSkill = getSkillTotal(character.pointsSpent[partySkillCheck.skill] ?? 0, getModifier(character.attributes[SKILL_LIST.find(skill => skill.name === partySkillCheck.skill)!.attributeModifier]));
              if (characterSkill > highestScore) {
                highestScoringCharacter = character;
              }
            }
            setPartySkillCheck(partySkillCheck => ({ ...partySkillCheck, results: {
              roll: randomInt,
              character: highestScoringCharacter,
            } }))
          }}>Roll</button>
          {!!partySkillCheck.results
            && <div>
              <p>Results</p>
              <p>Roll: {partySkillCheck.results.roll}</p>
              <p>Skill: {getSkillTotal(partySkillCheck.results.character.pointsSpent[partySkillCheck.skill] ?? 0, getModifier(partySkillCheck.results.character.attributes[SKILL_LIST.find(skill => skill.name === partySkillCheck.skill)!.attributeModifier]))}</p>
              <p>Result: {(partySkillCheck.results.roll + getSkillTotal(partySkillCheck.results.character.pointsSpent[partySkillCheck.skill] ?? 0, getModifier(partySkillCheck.results.character.attributes[SKILL_LIST.find(skill => skill.name === partySkillCheck.skill)!.attributeModifier]))) >= partySkillCheck.dc ? 'Success' : 'Failure'}</p>
            </div>
          }
        </div>
      </section>
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
            total: {getSkillTotal(data.pointsSpent[skill.name] ?? 0, getModifier(data.attributes[skill.attributeModifier]))}
          </div>)}
        </section>
        <section className="App-section">
          <p>Skill Check</p>
          <div>
            <span>Skill:</span>
            <select value={data.skillCheck.skill} onChange={e => setCharacterData(cds => cds.map(cd => cd.id === data.id ? { ...cd, skillCheck: { ...cd.skillCheck, skill: e.target.value } } : cd))}>
              {SKILL_LIST.map((skill, idx) => <option key={idx} value={skill.name}>{skill.name}</option>)}
            </select>
            <span>DC:</span>
            <input type='number' value={data.skillCheck.dc} onChange={e => setCharacterData(cds => cds.map(cd => cd.id === data.id ? { ...cd, skillCheck: { ...cd.skillCheck, dc: parseInt(e.target.value) } } : cd))} />
            <button onClick={() => {
              const random = Math.random();
              const randomInt = Math.floor(random * 20) + 1;
              setCharacterData(cds => cds.map(cd => cd.id === data.id ? { ...cd, skillCheck: { ...cd.skillCheck, roll: randomInt } } : cd));
            }}>Roll</button>
            {typeof data.skillCheck.roll === 'number'
              && <div>
                <p>Results</p>
                <p>Roll: {data.skillCheck.roll}</p>
                <p>Skill: {getSkillTotal(data.pointsSpent[data.skillCheck.skill] ?? 0, getModifier(data.attributes[SKILL_LIST.find(skill => skill.name === data.skillCheck.skill)!.attributeModifier]))}</p>
                <p>Result: {(data.skillCheck.roll! + getSkillTotal(data.pointsSpent[data.skillCheck.skill] ?? 0, getModifier(data.attributes[SKILL_LIST.find(skill => skill.name === data.skillCheck.skill)!.attributeModifier]))) >= data.skillCheck.dc ? 'Success' : 'Failure'}</p>
              </div>
            }
          </div>
        </section>
      </div>)}
    </div>
  );
}

export default App;
