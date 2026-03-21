/**
 * OscilloscopeSimulator
 * 
 * This class simulates a microcontroller that generates both analog and digital signals.
 * It simulates a 10-bit Analog-to-Digital Converter (ADC) and transmits the data
 * as comma-separated values over a simulated serial stream.
 */
export class OscilloscopeSimulator {
  constructor(options = {}) {
    // How many individual data points we evaluate per second 
    this.sampleRate = options.sampleRate || 2000;
    
    // Callback function to handle the output string (Simulating UART TX)
    this.onSerialData = options.onSerialData || (() => {});
    
    // Default Signal Parameters
    this.frequency = 5; // The speed of the wave (or baud rate multiplier for digital)
    this.amplitude = 2.5; // Voltage amplitude (0-2.5V from center)
    this.offset = 2.5; // DC Offset (centers wave at 2.5V)
    this.waveType = 'sine'; // sine, square, triangle, uart, i2c, spi
    this.message = 'HELLO'; // default message for digital protocols
    this.isRunning = false;
    
    // Simulation state trackers
    this.time = 0; // Simulated elapsed time
    this.tickCount = 0; // Number of atomic steps simulated
    
    // Digital protocol state tracker
    this.bitIndex = 0; // Tracks which bit we are currently transmitting
    
    // Generate the internal data structures for UART, I2C, and SPI based on the message
    this.buildProtocolSequences(this.message);
  }

  // Update parameters from the UI controls
  setParameters({ frequency, amplitude, waveType, message }) {
    if (frequency !== undefined) this.frequency = frequency;
    if (amplitude !== undefined) this.amplitude = amplitude;
    let didChange = false;
    
    // If wave protocol changes, we must rebuild the sequences
    if (waveType !== undefined && waveType !== this.waveType) {
      this.waveType = waveType;
      didChange = true;
    }
    
    // If the textual message changes, we must encode the new letters into bits
    if (message !== undefined && message !== this.message) {
      this.message = message || 'A';
      didChange = true;
    }
    
    if (didChange) {
      this.bitIndex = 0; // Reset back to start of sequence
      this.buildProtocolSequences(this.message); // Re-encode
    }
  }

  /**
   * Encodes a textual string into discrete bit sequences for UART, I2C, and SPI.
   * This allows the simulator to "bit-bang" realistic serial waveforms.
   */
  buildProtocolSequences(msg) {
    let uartSeq = [];
    let i2cSeq = [];
    let spiSeq = [];
    
    // Add an IDLE state before the sequence actually begins to give visual padding
    uartSeq.push(1, 1, 1, 1);
    i2cSeq.push([1,1], [1,1], [1,1]);
    spiSeq.push([0,0,1], [0,0,1], [0,0,1]); // CS is High (1) during SPI idle

    // Loop through every character in the user's message
    for (let i = 0; i < msg.length; i++) {
      const charCode = msg.charCodeAt(i); // Get the ASCII integer value
      
      // ---- UART (Universal Asynchronous Receiver-Transmitter) ----
      // 1 channel setup: TX (Transmit)
      // Protocol rule: START bit(0), then 8 Data bits (LSB first), then STOP bit(1)
      uartSeq.push(0); // START BIT (Always 0, pulls line low)
      for (let b = 0; b < 8; b++) {
        uartSeq.push((charCode >> b) & 1); // Extract bit from LSB to MSB
      }
      uartSeq.push(1); // STOP BIT (Always 1, returns line to idle high)
      uartSeq.push(1, 1, 1); // Inter-character delay (idle time between bytes)
      
      // ---- I2C (Inter-Integrated Circuit) ----
      // 2 channel setup: SCL (Clock), SDA (Data)
      // Protocol rule: START condition, 8 Data bits (MSB first) sampled on Clock High, ACK, STOP condition.
      i2cSeq.push([1,0], [0,0]); // START Condition: SDA pulled low while SCL is high
      for (let b = 7; b >= 0; b--) { // Note: I2C transmits Most Significant Bit (MSB) first
        const bit = (charCode >> b) & 1;
        // Data line (SDA) is prepped while Clock (SCL) is low, then Clock goes high to sample
        i2cSeq.push([0, bit], [1, bit], [0, bit]); 
      }
      i2cSeq.push([0, 0], [1, 0], [0, 0]); // Simulated ACK (Acknowledge) bit pulled low by receiver
      i2cSeq.push([0, 0], [1, 0], [1, 1]); // STOP Condition: SDA goes high while SCL is high
      i2cSeq.push([1, 1], [1, 1]); // Inter-character delay

      // ---- SPI (Serial Peripheral Interface) ----
      // 3 channel setup: SCK (Clock), MOSI (Data), CS (Chip Select)
      // Protocol rule: CS goes Low to select chip, Clock pulses, Data (MSB first) sampled on edge.
      spiSeq.push([0,0,0]); // CS Low (Active): Wakes up the peripheral
      for (let b = 7; b >= 0; b--) { // MSB first
        const bit = (charCode >> b) & 1;
        // SCK pulses high [1] then low [0], MOSI holds the data bit, CS remains low [0]
        spiSeq.push([0, bit, 0], [1, bit, 0], [0, bit, 0]); 
      }
      spiSeq.push([0,0,0], [0,0,1], [0,0,1]); // CS returns High (1) to end transmission
    }
    
    this.uartSeq = uartSeq;
    this.i2cSeq = i2cSeq;
    this.spiSeq = spiSeq;
  }

  // Simulation Controls
  start() {
    this.isRunning = true;
  }

  pause() {
    this.isRunning = false;
  }

  // Advance the simulated time forward by 'numSamples' steps
  advance(numSamples) {
    if (!this.isRunning) return;
    for (let i = 0; i < numSamples; i++) {
      this.tick();
    }
  }

  /**
   * The core physics and electronics engine.
   * Calculates voltages for the current sliver of time, runs them through the fake ADC,
   * and outputs the digital readings.
   */
  tick() {
    // Advance simulated time
    this.time += 1 / this.sampleRate;
    this.tickCount = (this.tickCount === undefined ? 0 : this.tickCount + 1);
    
    let v1 = 0, v2 = null, v3 = null; // Channel voltages

    const t = this.time;
    const f = this.frequency;
    const a = this.amplitude;

    // Evaluate standard continuous analog waveforms purely by math
    if (['sine', 'square', 'triangle'].includes(this.waveType)) {
      switch (this.waveType) {
        case 'sine':
          v1 = this.offset + a * Math.sin(2 * Math.PI * f * t);
          break;
        case 'square':
          v1 = this.offset + a * Math.sign(Math.sin(2 * Math.PI * f * t));
          break;
        case 'triangle':
          v1 = this.offset + (2 * a / Math.PI) * Math.asin(Math.sin(2 * Math.PI * f * t));
          break;
      }
    } else {
      // Evaluate discrete digital protocol bitstreams
      
      // Frequency acts as baud rate modifier. 4 bits per Hz.
      const bitsPerSecond = f * 4; 
      
      // Calculate how many simulation "ticks" a single bit should last
      const samplesPerBit = Math.max(1, Math.floor(this.sampleRate / bitsPerSecond));
      
      // Move to the next bit in our sequence array when enough time has passed
      if (this.tickCount % samplesPerBit === 0) {
        this.bitIndex++;
      }

      // 5 Volts is Logic High (1), 0 Volts is Logic Low (0)
      const logicHigh = 5.0;
      const logicLow = 0.0;

      // Extract the exact 5V or 0V logic level for the current bit of the selected protocol
      if (this.waveType === 'uart') {
        const sequence = this.uartSeq;
        const bit = sequence[this.bitIndex % sequence.length];
        v1 = bit ? logicHigh : logicLow;

      } else if (this.waveType === 'i2c') {
        const sequence = this.i2cSeq;
        const state = sequence[this.bitIndex % sequence.length];
        v1 = state[0] ? logicHigh : logicLow; // CH1: SCL
        v2 = state[1] ? logicHigh : logicLow; // CH2: SDA
        
      } else if (this.waveType === 'spi') {
        const sequence = this.spiSeq;
        const state = sequence[this.bitIndex % sequence.length];
        v1 = state[0] ? logicHigh : logicLow; // CH1: SCK
        v2 = state[1] ? logicHigh : logicLow; // CH2: MOSI
        v3 = state[2] ? logicHigh : logicLow; // CH3: CS
      }
    }

    /**
     * Simulation of Microcontroller Input Constraints (Protection & ADC)
     * Maps an infinite 0-5V continuous float to a constrained 10-bit integer (0 to 1023).
     */
    const processVolt = (v) => {
      if (v === null) return null;
      // 1. Clip voltage strictly between 0 and 5 Volts to simulate real hardware limits
      let clipped = Math.max(0, Math.min(5, v));
      // 2. Perform 10-bit ADC conversion (5V -> 1023)
      return Math.floor((clipped / 5) * 1023); 
    };

    const adc1 = processVolt(v1);
    const adc2 = processVolt(v2);
    const adc3 = processVolt(v3);

    // Construct the Serial String payload (e.g., "512,1023,0\n")
    let msg = `${adc1}`;
    if (adc2 !== null) msg += `,${adc2}`;
    if (adc3 !== null) msg += `,${adc3}`;
    msg += `\n`;

    // Dispatch the payload up to the UI React component
    this.onSerialData(msg);
  }
}
