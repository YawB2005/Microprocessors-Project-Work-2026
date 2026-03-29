"use client";

/**
 * Controls Component
 * 
 * Provides the interactive UI panel to manipulate the Oscilloscope setup.
 * All state is passed down from the parent `page.js` to keep the UI in sync with the Simulator.
 */
export default function Controls({ 
  isRunning, setIsRunning, 
  frequency, setFrequency, 
  amplitude, setAmplitude, 
  waveType, setWaveType,
  message, setMessage
}) {
  // Check if current wave is a digital logic protocol requiring text input
  const isDigital = ['uart', 'i2c', 'spi'].includes(waveType);

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <h2>CONTROLS</h2>
        <button 
          style={isRunning ? playButtonStyleRunning : playButtonStyle} 
          onClick={() => setIsRunning(!isRunning)}
        >
          {isRunning ? '[||] PAUSE' : '[>] RUN'}
        </button>
      </div>

      <div style={gridStyle}>
        {/* Analog Signal Selection */}
        <div style={controlGroupStyle}>
          <label style={labelStyle}>ANALOG SIGNALS</label>
          <div style={buttonGroupStyle}>
            {['sine', 'square', 'triangle'].map(type => (
              <button
                key={type}
                style={waveType === type ? activeBtnStyle : btnStyle}
                onClick={() => setWaveType(type)}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Digital Protocol Selection */}
        <div style={controlGroupStyle}>
          <label style={labelStyle}>DIGITAL PROTOCOLS</label>
          <div style={{...buttonGroupStyle, marginTop: '4px'}}>
            {['uart', 'i2c', 'spi'].map(type => (
              <button
                key={type}
                style={waveType === type ? activeBtnStyle : btnStyle}
                onClick={() => setWaveType(type)}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Data Message Input (Only for digital protocols) */}
        {isDigital && (
          <div style={controlGroupStyle}>
            <div style={labelRowStyle}>
              <label style={labelStyle}>DATA MESSAGE</label>
            </div>
            <input 
              type="text" 
              maxLength="10"
              value={message} 
              onChange={(e) => setMessage(e.target.value.toUpperCase())}
              style={textInputStyle}
            />
          </div>
        )}

        <div style={controlGroupStyle}>
          <div style={labelRowStyle}>
            <label style={labelStyle}>FREQ / BAUD RATE</label>
            <span style={valueStyle}>{frequency} HZ</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="50" 
            step="1" 
            value={frequency} 
            onChange={(e) => setFrequency(Number(e.target.value))}
            style={sliderStyle}
          />
        </div>

        <div style={controlGroupStyle}>
          <div style={labelRowStyle}>
            <label style={labelStyle}>AMPLITUDE (VP)</label>
            <span style={valueStyle}>{amplitude} V</span>
          </div>
          <input 
            type="range" 
            min="0.1" 
            max="2.5" 
            step="0.1" 
            value={amplitude} 
            onChange={(e) => setAmplitude(Number(e.target.value))}
            style={sliderStyle}
          />
          <small style={{color: '#888', fontSize: '10px', marginTop: '4px', textTransform: 'uppercase'}}>
            * CLIPS AT 0V AND 5V.
          </small>
        </div>
      </div>
    </div>
  );
}

const panelStyle = {
  background: '#000000',
  border: '2px solid #ffffff',
  padding: '1.5rem',
  margin: '1rem',
  minWidth: '320px',
  fontFamily: 'monospace',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem',
  color: '#ffffff',
  textTransform: 'uppercase',
  borderBottom: '2px solid #ffffff',
  paddingBottom: '0.5rem',
};

const playButtonStyle = {
  background: '#000000',
  color: '#ffffff',
  border: '2px solid #ffffff',
  padding: '8px 16px',
  fontWeight: 'bold',
  cursor: 'pointer',
  textTransform: 'uppercase',
  fontFamily: 'monospace',
  fontSize: '1rem',
};

const playButtonStyleRunning = {
  ...playButtonStyle,
  background: '#ffffff',
  color: '#000000',
};

const gridStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

const controlGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
};

const labelRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  marginBottom: '4px',
};

const labelStyle = {
  color: '#ffffff',
  fontSize: '1rem',
  fontWeight: 'bold',
};

const valueStyle = {
  color: '#ffffff',
  fontSize: '1.2rem',
  fontWeight: 'bold',
  background: '#000000',
  padding: '2px 8px',
  border: '1px solid #ffffff',
};

const buttonGroupStyle = {
  display: 'flex',
  background: '#000000',
  border: '2px solid #ffffff',
  gap: '0',
};

const btnStyle = {
  flex: 1,
  background: '#000000',
  border: '1px solid #ffffff',
  borderLeft: 'none',
  borderRight: '1px solid #ffffff',
  padding: '8px 4px',
  color: '#ffffff',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: 'bold',
  fontFamily: 'monospace',
};

const activeBtnStyle = {
  ...btnStyle,
  background: '#ffffff',
  color: '#000000',
};

const sliderStyle = {
  width: '100%',
  accentColor: '#ffffff',
  height: '2px',
  background: '#ffffff',
  appearance: 'none',
  cursor: 'pointer',
  outline: 'none',
  marginTop: '8px',
};

const textInputStyle = {
  width: '100%',
  background: '#000000',
  color: '#ffffff',
  border: '1px solid #ffffff',
  padding: '8px',
  fontFamily: 'monospace',
  fontSize: '1.2rem',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  outline: 'none',
};
