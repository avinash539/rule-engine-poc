import { useState, useEffect, useCallback } from 'react';
import { DecisionGraph, JdmConfigProvider } from '@gorules/jdm-editor';
import '@gorules/jdm-editor/dist/style.css';

const API_URL = 'http://localhost:8000/api';

function App() {
  const [rules, setRules] = useState([]);
  const [selectedRule, setSelectedRule] = useState(null);
  const [graph, setGraph] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const res = await fetch(`${API_URL}/rules`);
      const data = await res.json();
      setRules(data);
    } catch (err) {
      console.error('Failed to fetch rules', err);
    }
  };



  const saveRule = async () => {
    if (!selectedRule || !graph) return;
    try {
      await fetch(`${API_URL}/rules/${selectedRule}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: graph }),
      });
      alert('Saved successfully!');
    } catch (err) {
      console.error('Failed to save rule', err);
      alert('Failed to save');
    }
  };

  const createRule = async () => {
    const name = prompt('Enter rule name (e.g., my_new_rule):');
    if (!name) return;

    const fileName = name.endsWith('.json') ? name : `${name}/rule.json`;
    // Basic JDM template
    const template = {
      contentType: 'application/vnd.gorules.decision',
      nodes: [
        { id: 'input-node', type: 'inputNode', position: { x: 100, y: 100 }, name: 'Request' },
        { id: 'output-node', type: 'outputNode', position: { x: 500, y: 100 }, name: 'Response' }
      ],
      edges: []
    };

    try {
      await fetch(`${API_URL}/rules/${fileName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: template }),
      });
      await fetchRules(); // Refresh list
      loadRule(fileName); // Load the new rule
    } catch (err) {
      console.error('Failed to create rule', err);
      alert('Failed to create rule');
    }
  };

  const [simulationInput, setSimulationInput] = useState('{}');
  const [simulationResult, setSimulationResult] = useState(null);
  const [trace, setTrace] = useState(null);
  const [showSimulation, setShowSimulation] = useState(false);
  const [testDataFiles, setTestDataFiles] = useState([]);
  const [selectedTestData, setSelectedTestData] = useState('');

  const loadTestData = async (rulePath) => {
    try {
      const res = await fetch(`${API_URL}/rules/${rulePath}/data`);
      const files = await res.json();
      setTestDataFiles(files);
      if (files.length > 0) {
        fetchTestDataContent(rulePath, files[0]);
      } else {
        setSimulationInput('{}');
        setSelectedTestData('');
      }
    } catch (err) {
      console.error('Failed to load test data files', err);
    }
  };

  const fetchTestDataContent = async (rulePath, filename) => {
    try {
      const res = await fetch(`${API_URL}/rules/${rulePath}/data/${filename}`);
      const content = await res.json();
      setSimulationInput(JSON.stringify(content, null, 2));
      setSelectedTestData(filename);
    } catch (err) {
      console.error('Failed to load test data content', err);
    }
  };

  const loadRule = async (path) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/rules/${path}`);
      const data = await res.json();
      setGraph(data);
      setSelectedRule(path);
      setSimulationResult(null);
      setTrace(null);
      loadTestData(path);
    } catch (err) {
      console.error('Failed to load rule', err);
    } finally {
      setLoading(false);
    }
  };

  const runSimulation = async () => {
    if (!graph) return;
    try {
      const context = JSON.parse(simulationInput);
      const res = await fetch(`${API_URL}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: graph, context }),
      });
      const data = await res.json();
      setSimulationResult(data.result);
      setTrace(data.trace);
    } catch (err) {
      console.error('Simulation failed', err);
      alert('Simulation failed: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: '250px', borderRight: '1px solid #ccc', display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>
        <div style={{ padding: '15px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>JDM Rules</h3>
          <button onClick={createRule} style={{ padding: '4px 8px', cursor: 'pointer' }}>+</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {rules.map((rule) => (
              <li
                key={rule.path}
                style={{
                  padding: '10px',
                  cursor: 'pointer',
                  background: selectedRule === rule.path ? '#e0e0e0' : 'white',
                  borderRadius: '4px',
                  marginBottom: '8px',
                  border: '1px solid #ddd'
                }}
                onClick={() => loadRule(rule.path)}
              >
                {rule.name}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Editor */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ padding: '10px', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
          <span style={{ fontWeight: 'bold' }}>{selectedRule || 'Select a rule'}</span>
          <div>
            <button onClick={() => setShowSimulation(!showSimulation)} disabled={!selectedRule} style={{ padding: '8px 15px', cursor: 'pointer', marginRight: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', opacity: !selectedRule ? 0.5 : 1 }}>
              {showSimulation ? 'Hide Simulation' : 'Simulate'}
            </button>
            <button onClick={saveRule} disabled={!selectedRule} style={{ padding: '8px 20px', cursor: 'pointer', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', opacity: !selectedRule ? 0.5 : 1 }}>
              Save
            </button>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            {graph && (
              <div style={{ height: '100%', width: '100%' }}>
                <JdmConfigProvider>
                  <DecisionGraph
                    value={graph}
                    onChange={setGraph}
                    simulate={trace ? { result: simulationResult, trace: trace } : undefined}
                  />
                </JdmConfigProvider>
              </div>
            )}
            {!graph && !loading && (
              <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Select a rule from the sidebar to edit</div>
            )}
            {loading && (
              <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading...</div>
            )}
          </div>

          {/* Simulation Panel */}
          {showSimulation && (
            <div style={{ width: '350px', borderLeft: '1px solid #ccc', display: 'flex', flexDirection: 'column', background: 'white', padding: '10px', overflowY: 'auto' }}>
              <h4>Simulation Input (JSON)</h4>
              {testDataFiles.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Load Test Data:</label>
                  <select
                    value={selectedTestData}
                    onChange={(e) => fetchTestDataContent(selectedRule, e.target.value)}
                    style={{ width: '100%', padding: '5px' }}
                  >
                    {testDataFiles.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              )}
              <textarea
                value={simulationInput}
                onChange={(e) => setSimulationInput(e.target.value)}
                style={{ width: '100%', height: '200px', fontFamily: 'monospace', marginBottom: '10px' }}
              />
              <button onClick={runSimulation} style={{ padding: '8px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '10px' }}>
                Run Simulation
              </button>

              <h4>Result</h4>
              <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', overflowX: 'auto', fontSize: '12px' }}>
                {simulationResult ? JSON.stringify(simulationResult, null, 2) : 'No result yet'}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
