# Custom Oscilloscope: Web-Based Digital Oscilloscope & Protocol Simulator

This repository contains the source code for a web-based Digital Oscilloscope developed for COE 381. The project gives users a simple way to generate continuous waves (like sine or square waves) and see how computers send text messages to each other using standard communication methods (UART, I2C, SPI).

## Documentation 

### Problem Statement
Learning about how computers talk to each other (using methods like UART, I2C, and SPI) can be hard to visualize. Normally, you would need expensive equipment like a real digital oscilloscope or a logic analyzer to see these signals in action. 

Students and developers needed an easy, free way to see how simple text messages are turned into electrical signals (high and low voltages) over time. We wanted to create a tool right in the web browser that behaves and looks just like a real piece of hardware testing equipment.

### Methodologies
We built this project using a web framework called Next.js and used web graphics (HTML5 Canvas) to draw the signal waves smoothly. Here is how we tackled the main features:

1. **Virtual Microcontroller Engine**
   We created a "virtual brain" in the code that calculates what a signal should look like 2,000 times a second. This makes sure the waves and signals move smoothly across the screen just like real life.

2. **Simulating Real Hardware**
   In the real world, a component called an Analog-to-Digital Converter (ADC) reads voltages (like 0 to 5 Volts) and turns them into numbers a computer can read (from 0 to 1023). We recreated this exact process in our code so that the simulator outputs data just like a real Arduino or similar circuit board.

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
*   **Great Performance:** By using simple math instructions to draw the lines, the web browser was able to easily handle drawing thousands of data points every second without lagging.
*   **Clear Visuals:** Stacking the different signals on top of each other made it incredibly easy to see how different communication lines work together (for example, seeing a clock line pulse exactly when a data line changes).
*   **Realistic Data Flow:** Processing the simulator data the same way a real hardware sensor would (turning it into a string of numbers) made the code much simpler and easier to manage.

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
