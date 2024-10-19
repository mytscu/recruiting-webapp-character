import { useState } from 'react';
import './App.css';
import { ATTRIBUTE_LIST, CLASS_LIST, SKILL_LIST } from './consts';
import { Attributes, Class } from './types';

const getModifier = (ability: number) => {
  return Math.floor((ability - 10) / 2)
}

function App() {
  const [num, setNum] = useState<number>(0);
  const [attributeControls, setAttributeControls] = useState<Attributes>({
    'Strength': 0,
    'Dexterity': 0,
    'Constitution': 0,
    'Intelligence': 0,
    'Wisdom': 0,
    'Charisma': 0,
  });
  const [openClassRequirements, setOpenClassRequirements] = useState<Class>();
  const [pointsSpent, setPointsSpent] = useState<{ [x: string]: number }>({});

  return (
    <div className="App">
      <header className="App-header">
        <h1>React Coding Exercise</h1>
      </header>
      <section className="App-section">
        {ATTRIBUTE_LIST.map((attribute, idx) =>
          <div key={idx}>
            <button onClick={() => setAttributeControls(attributeControls => ({ ...attributeControls, [attribute]: attributeControls[attribute] + 1 }))}>
              Increase
            </button>
            <button onClick={() => setAttributeControls(attributeControls => ({ ...attributeControls, [attribute]: attributeControls[attribute] - 1 }))}>
              Decrease
            </button>
            <span>{attribute}: {attributeControls[attribute]} (Modifier: {getModifier(attributeControls[attribute])})</span>
          </div>
        )}
      </section>
      <section className="App-section">
        {Object.keys(CLASS_LIST).map((className: Class, idx) =>
          <div key={idx}>
            <p
              style={Object.keys(CLASS_LIST[className]).every(attr => CLASS_LIST[className][attr] <= attributeControls[attr]) ? { color: 'red' } : {}}
              onClick={() => setOpenClassRequirements(className)}
            >
              {className}
            </p>
            {className === openClassRequirements
              && <div>
                {Object.keys(CLASS_LIST[className]).map(attr => <p>{attr}: {CLASS_LIST[className][attr]}</p>)}
                <button onClick={() => setOpenClassRequirements(undefined)}>Close requirement view</button>
              </div>
            }
          </div>
        )}
      </section>
      <section className="App-section">
        <p>Skills</p>
        <p>Total skill points available: {Math.max(0, 10 + 4 * getModifier(attributeControls['Intelligence']))}</p>
        {SKILL_LIST.map((skill, idx) => <div key={idx}>
          {skill.name} - points: {pointsSpent[skill.name] ?? 0}
          <button style={{ display: 'inline' }} onClick={() => setPointsSpent(pointsSpent => ({ ...pointsSpent, [skill.name]: (pointsSpent[skill.name] ?? 0) + 1 }))}>[+]</button>
          <button style={{ display: 'inline' }}  onClick={() => setPointsSpent(pointsSpent => ({ ...pointsSpent, [skill.name]: (pointsSpent[skill.name] ?? 0) - 1 }))}>[-]</button>
          modifier ({skill.attributeModifier.slice(0, 3)}): {getModifier(attributeControls[skill.attributeModifier])}
          total: {(pointsSpent[skill.name] ?? 0) + getModifier(attributeControls[skill.attributeModifier])}
        </div>)}
      </section>
    </div>
  );
}

export default App;
