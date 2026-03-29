"use client";
import { useState } from 'react';
import OscilloscopeDisplay from '../components/OscilloscopeDisplay';
import Controls from '../components/Controls';

export default function Home() {
  const [isRunning, setIsRunning] = useState(true);
  const [frequency, setFrequency] = useState(5);
  const [amplitude, setAmplitude] = useState(2.5); // 0-2.5 around a 2.5V offset
  const [waveType, setWaveType] = useState('uart');
  const [message, setMessage] = useState('HELLO');

  return (
    <main style={mainStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>DIGITAL OSCILLOSCOPE</h1>
        <p style={subtitleStyle}>COE 381 PROJECT</p>
      </div>

      <div style={contentStyle}>
        <div style={displayWrapper}>
          <OscilloscopeDisplay 
            isRunning={isRunning} 
            frequency={frequency} 
            amplitude={amplitude} 
            waveType={waveType}
            message={message} 
          />
        </div>
        
        <div style={controlsWrapper}>
          <Controls 
            isRunning={isRunning} setIsRunning={setIsRunning}
            frequency={frequency} setFrequency={setFrequency}
            amplitude={amplitude} setAmplitude={setAmplitude}
            waveType={waveType} setWaveType={setWaveType}
            message={message} setMessage={setMessage}
          />
        </div>
      </div>
    </main>
  );
}

const mainStyle = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  padding: '2rem',
  alignItems: 'center',
  background: '#000000',
  fontFamily: 'monospace',
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '2rem',
  borderBottom: '2px solid #ffffff',
  paddingBottom: '1rem',
  width: '100%',
  maxWidth: '1200px',
};

const titleStyle = {
  fontSize: '2.5rem',
  fontWeight: 'bold',
  letterSpacing: '2px',
  color: '#ffffff',
  margin: '0 0 0.5rem 0',
  textTransform: 'uppercase',
};

const subtitleStyle = {
  color: '#ffffff',
  fontSize: '1.2rem',
  letterSpacing: '1px',
  textTransform: 'uppercase',
};

const contentStyle = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: '2rem',
  justifyContent: 'center',
  alignItems: 'flex-start',
  width: '100%',
  maxWidth: '1200px',
};

const displayWrapper = {
  flex: '1 1 600px',
  display: 'flex',
  justifyContent: 'center',
};

const controlsWrapper = {
  flex: '0 1 350px',
};
