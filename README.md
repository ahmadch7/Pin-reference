# Pin-Reference

**An interactive microcontroller pinout and datasheet companion — with live Arduino IDE / USB board detection.**

Pin-Reference puts a development board's physical pinout, key specifications, default
peripheral buses, and silicon gotchas in one place, so you can plan wiring without
juggling a dozen datasheet PDFs. It also detects the board plugged into your USB port
and shows its pinout automatically.

## Features

- **Interactive pinout map** for popular boards: ESP32 DevKit V1, ESP32-S3, Arduino
  Uno / Nano / Mega / Leonardo, and NodeMCU (ESP8266).
- **Signal highlighting** — filter pins by GPIO, analog (ADC/DAC), protocol
  (SPI / I2C / UART), and critical strapping / caution pins.
- **Spec & datasheet panel** — architecture, clock, logic voltage, flash/RAM, ADC
  channels, default bus pin mappings, and links to official datasheets.
- **Silicon constraints & wiring safety** — flags input-only pins, flash pins,
  strapping/boot pins, ADC2-vs-WiFi conflicts, and 3.3 V vs 5 V hazards.
- **Live USB board detection** — when you plug a board into USB, the site identifies
  it and shows its pinout; unplug it and it clears. Genuine boards (e.g. Arduino Uno)
  are identified directly from USB; clone boards (CH340/CP2102) borrow the identity
  you've selected in the Arduino IDE.
- **Dynamic catalog** — search any other chip and a pinout is generated on demand via
  the Gemini API.

## How USB detection works

The backend reads the Arduino IDE's current board selection from its local app state
and uses the IDE-bundled `arduino-cli` to see what's physically connected, then
checks the Windows serial-port list to confirm a board's port is actually present.
This is Windows-specific today (it reads `%APPDATA%/arduino-ide` and the registry's
`SERIALCOMM` list).

## Tech stack

React 19 + TypeScript, Vite, Tailwind CSS, an Express/Node backend (`server.ts`), and
the Google Gemini API for the dynamic catalog.

## Run locally

**Prerequisites:** Node.js. (USB detection additionally expects Arduino IDE 2.x
installed.)

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and set your `GEMINI_API_KEY` (only needed for the
   dynamic catalog; the preloaded boards work without it).
3. Run the app: `npm run dev`
4. Open http://localhost:3000

## A note on data accuracy

The preloaded boards are hand-verified. Boards produced by the dynamic catalog are
AI-generated and should be cross-checked against the manufacturer datasheet before you
wire anything up — never trust a generated pin label with real voltage on the line.

---

Built by Ahmad Chahoud.
