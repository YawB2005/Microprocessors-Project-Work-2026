# Custom Oscilloscope Simulation

This repository contains the software simulation for a custom Digital Oscilloscope project developed for COE 381. The simulation gives users a simple way to generate continuous waves (like sine or square waves) and see how computers send text messages to each other using standard communication methods (UART, I2C, SPI).

## Documentation 

### Problem Statement
The main aim of our project was to build a physical, custom digital oscilloscope using an Arduino kit. The hardware was intended to sense signal waveforms using a sensor, read them, and pass that data through a serial connection to be displayed on a PC. 

However, since we did not have access to the physical Arduino kit and sensors, we created this project as a complete software simulation of that setup. Our goal here was to model exactly how the Arduino works with various signals from reading artificial sensor inputs to converting and sending them to the screen—all within a web browser without needing any physical parts.

### Methodologies
We built this simulation using a web framework called Next.js and used web graphics (HTML5 Canvas) to draw the signal waves smoothly. To mimic the Arduino hardware setup, we tackled the following features:

1. **Virtual Microcontroller Engine**
   We created a "virtual Arduino brain" in the code that calculates what a sensor's signal should look like 2,000 times a second. This makes sure the waves and signals move smoothly across the screen just like real life.

2. **Simulating Real Hardware (ADC)**
   In the real world, the Arduino uses a component called an Analog-to-Digital Converter (ADC) to read sensor voltages (like 0 to 5 Volts) and turns them into numbers a computer can display (from 0 to 1023). We recreated this exact process in our code so that the simulator acts and outputs data identically to the physical Arduino we originally planned to use.

   ```javascript
   // Example showing how we translate an exact voltage into a computer-friendly number
   const processVolt = (voltage) => {
     if (voltage === null) return null;
     
     // Limit the voltage between 0 and 5 Volts, just like real hardware
     let clipped = Math.max(0, Math.min(5, voltage));
     
     // Convert that 5V range into a number from 0 to 1023
     return Math.floor((clipped / 5) * 1023); 
   };
   ```

3. **Turning Text into Signals**
   When a user types a word, the simulator breaks it down letter by letter and then into 1s and 0s. It then creates the exact high and low signals needed to send that text using different communication styles (UART, I2C, SPI). For example, SPI uses three different lines (clock, data, and chip select) working together in harmony.

4. **Smooth Screen Drawing**
   To keep the animation looking great without slowing down the user's computer, we only draw the most recent part of the wave using optimized shapes, keeping the frame rate at a steady 60 frames per second.

### Findings
*   **Successful Simulation:** We successfully proved that we could build a fully working model of the custom oscilloscope in software, replicating everything from its voltage limits to how it streams data from a "sensor."
*   **Great Performance:** By using simple math instructions to draw the lines, the web browser was able to easily handle drawing thousands of data points every second without lagging.
*   **Clear Visuals:** Stacking the different signals on top of each other made it incredibly easy to see how different communication lines work together (for example, seeing a clock line pulse exactly when a data line changes).

Below is a simple example from our code showing how we prepare the lines to send data using the SPI protocol:

```javascript
// A simple look at how we prepare an SPI message step-by-step
// SPI uses 3 wires: Clock, Data, and Chip Select (to wake up the device)

spiSeq.push([0, 0, 0]); // Step 1: Wake up the device (Chip Select goes Low)

// Step 2: Send each piece of data bit-by-bit
for (let b = 7; b >= 0; b--) { 
  const bit = (charCode >> b) & 1; // Get a single 1 or 0 from the letter
  
  // Create the pulse: The clock goes high, then low, while sending the data
  spiSeq.push([0, bit, 0], [1, bit, 0], [0, bit, 0]); 
}

// Step 3: Put the device back to sleep to finish
spiSeq.push([0, 0, 0], [0, 0, 1], [0, 0, 1]); 
```
