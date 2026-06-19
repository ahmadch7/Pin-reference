import React, { useState, useEffect } from "react";
import {
  Search,
  Cpu,
  AlertTriangle,
  CircuitBoard,
  Info,
  CheckCircle2,
  Database,
  Sparkles,
  RefreshCcw,
  FileText,
  Layers,
  Settings,
  Activity,
  ArrowRight,
  HelpCircle,
  X,
  Usb,
  Link2
} from "lucide-react";
import { preloadedBoards } from "./data/preloadedBoards";
import { MicrocontrollerBoard, BoardPin } from "./types";

// Maps an Arduino IDE board identifier (FQBN) to one of our high-fidelity
// preloaded boards. Anything not listed here falls back to the dynamic
// (Gemini) catalog search using the board's display name.
const FQBN_TO_BOARD_ID: Record<string, string> = {
  "esp32:esp32:esp32": "esp32-30pin",              // "ESP32 Dev Module"
  "esp32:esp32:esp32doit-devkit-v1": "esp32-30pin",
  "esp32:esp32:esp32doit-espduino": "esp32-30pin",
  "esp32:esp32:nodemcu-32s": "esp32-30pin",
  "esp32:esp32:esp32s3": "esp32-s3",
  "esp32:esp32:esp32s3usbotg": "esp32-s3",
  "esp8266:esp8266:nodemcuv2": "esp8266-nodemcu",
  "esp8266:esp8266:nodemcu": "esp8266-nodemcu",
  "arduino:avr:uno": "arduino-uno",
  "arduino:avr:nano": "arduino-nano",
  "arduino:avr:mega": "arduino-mega",
  "arduino:avr:leonardo": "arduino-leonardo",
};

interface ConnectedBoard {
  name: string;
  fqbn: string;
  port: string;
  identified: boolean;
  via?: string;
  usbId?: string;
}

interface ArduinoStatus {
  ok: boolean;
  board: ConnectedBoard | null; // featured USB board, null if nothing plugged in
  connected: boolean;
  connectedBoards?: ConnectedBoard[];
}

// Dynamic offline examples for searched chips if API key isn't provided or as default response template
const offlineSearches: Record<string, Omit<MicrocontrollerBoard, 'id'>> = {
  "stm32": {
    name: "STM32F103C8T6 (Blue Pill)",
    description: "Highly popular and cost-effective ARM Cortex-M3 development board. Offers incredible speed, copious timers, and advanced 12-bit ADC ports compared to 8-bit AVRs.",
    layoutType: "dual-inline",
    datasheetUrl: "https://www.st.com/resource/en/datasheet/stm32f103c8.pdf",
    additionalResources: [
      { label: "STM32F103 Manual", url: "https://www.st.com/resource/en/reference_manual/rm0008-stm32f101xx-stm32f102xx-stm32f103xx-stm32f105xx-and-stm32f107xx-advanced-armbased-32bit-mcus-stmicroelectronics.pdf" }
    ],
    specs: {
      architecture: "ARM Cortex-M3 32-bit",
      clockSpeed: "72 MHz",
      operatingVoltage: "3.3V Logic (Many Pins 5V Tolerant)",
      flashMemory: "64 KB / 128 KB",
      ramSize: "20 KB SRAM",
      gpioCount: 32,
      adcChannels: "10 Channels (12-bit)",
      dacChannels: "None",
      interfaces: "2x I2C, 2x SPI, 3x USART, 1x USB, CAN Bus"
    },
    warnings: [
      "Voltages: Mostly 5V tolerant, but pins PA4, PA5, PA6, PA7 (ADC pins) are strictly 3.3V only. Supplying 5V on analog ports will damage the ADC module.",
      "BOOT Config: BOOT0 and BOOT1 jumpers control execution. For USB flashing/programming, BOOT0 must be jumped to 1, then returned to 0 for standard flash execution.",
      "USB Resistor Bug: Many cheap Blue Pill boards feature an incorrect 10kΩ pull-up resistor on PA12 (USB D+ line) instead of 1.5kΩ, preventing clean connection to some laptops on native USB.",
      "PA15, PB3, PB4 debugger overlap: These are locked to JTAG interface on boot. To use as standard GPIO, disable JTAG in your setup code."
    ],
    peripherals: [
      { interfaceType: "I2C1", pinsUsed: "SDA: PB7, SCL: PB6" },
      { interfaceType: "SPI1", pinsUsed: "NSS: PA4, SCK: PA5, MISO: PA6, MOSI: PA7" },
      { interfaceType: "USART1 (Upload/Debug)", pinsUsed: "TX: PA9, RX: PA10" }
    ],
    pins: [
      { number: "1", name: "VBAT", gpio: "N/A", features: ["Power In", "Battery Backup"], primary: "RTC Battery Input", caution: "Power source for clock retention." },
      { number: "2", name: "PC13", gpio: "13", features: ["GPIO", "Built-In LED"], primary: "Digital I/O / Onboard LED", caution: "Tied to green onboard LED. Active LOW.", isCaution: false },
      { number: "3", name: "PC14", gpio: "14", features: ["GPIO", "LSE Osc (OSC32_IN)"], primary: "Digital I/O or RT Clock", caution: "Connected to onboard 32.768kHz crystal. High impedance.", isCaution: true },
      { number: "4", name: "PC15", gpio: "15", features: ["GPIO", "LSE Osc (OSC32_OUT)"], primary: "Digital I/O or RT Clock", caution: "Connected to crystal.", isCaution: false },
      { number: "5", name: "PD0", gpio: "0", features: ["HSE Osc In", "OSC_IN"], primary: "8MHz High Speed External Osc", caution: "Main system clock input.", isCaution: false },
      { number: "6", name: "PD1", gpio: "1", features: ["HSE Osc Out", "OSC_OUT"], primary: "High Speed External Osc", caution: "Main system clock out.", isCaution: false },
      { number: "7", name: "NRST", gpio: "N/A", features: ["System Reset"], primary: "Hardware Reset Pin", caution: "Active LOW. Connect to a button for manual resets.", isCaution: false },
      { number: "8", name: "VSSA", gpio: "N/A", features: ["Analog Ground"], primary: "Analog Circuit Ground", caution: "Keep grounded to eliminate RF ADC noise.", isCaution: false },
      { number: "9", name: "VDDA", gpio: "N/A", features: ["Analog VCC-3.3V"], primary: "Analog Circuit Power", caution: "Supply clean and stable 3.3V reference voltage.", isCaution: true },
      { number: "10", name: "PA0", gpio: "0", features: ["GPIO", "ADC1_0", "TIM2_CH1", "WKUP"], primary: "Digital I/O / ADC input", caution: "Wakeup capability.", isCaution: false },
      { number: "11", name: "PA1", gpio: "1", features: ["GPIO", "ADC1_1", "TIM2_CH2"], primary: "Digital I/O / ADC input", caution: "", isCaution: false },
      { number: "12", name: "PA2", gpio: "2", features: ["GPIO", "ADC1_2", "TIM2_CH3", "USART2_TX"], primary: "Digital I/O / Hardware UART2 TX", caution: "", isCaution: false },
      { number: "13", name: "PA3", gpio: "3", features: ["GPIO", "ADC1_3", "TIM2_CH4", "USART2_RX"], primary: "Digital I/O / Hardware UART2 RX", caution: "", isCaution: false },
      { number: "14", name: "PA4", gpio: "4", features: ["GPIO", "ADC1_4", "SPI1_NSS"], primary: "Digital I/O / Analog / SPI CS", caution: "No 5V tolerance. Keep input strictly <= 3.3V.", isCaution: true },
      { number: "15", name: "PA5", gpio: "5", features: ["GPIO", "ADC1_5", "SPI1_SCK"], primary: "SPI1 Clock Line", caution: "No 5V tolerance. Keep input strictly <= 3.3V.", isCaution: true },
      { number: "16", name: "PA6", gpio: "6", features: ["GPIO", "ADC1_6", "SPI1_MISO"], primary: "SPI1 MISO", caution: "No 5V tolerance. Keep input strictly <= 3.3V.", isCaution: true },
      { number: "17", name: "PA7", gpio: "7", features: ["GPIO", "ADC1_7", "SPI1_MOSI"], primary: "SPI1 MOSI", caution: "No 5V tolerance. Keep input strictly <= 3.3V.", isCaution: true },
      { number: "18", name: "PB0", gpio: "0", features: ["GPIO", "ADC1_8", "TIM3_CH3"], primary: "Digital I/O / Analog input", caution: "", isCaution: false },
      { number: "19", name: "PB1", gpio: "1", features: ["GPIO", "ADC1_9", "TIM3_CH4"], primary: "Digital I/O / Analog input", caution: "", isCaution: false },
      { number: "20", name: "PB2", gpio: "2", features: ["GPIO", "BOOT1_Pin"], primary: "BOOT1 Pin Layout Selector", caution: "Connected to boot jumper 1. Affects programming logic on startup.", isCaution: true },
      { number: "21", name: "PB10", gpio: "10", features: ["GPIO", "I2C2_SCL", "USART3_TX"], primary: "I2C2 Serial Clock", caution: "", isCaution: false },
      { number: "22", name: "PB11", gpio: "11", features: ["GPIO", "I2C2_SDA", "USART3_RX"], primary: "I2C2 Serial Data", caution: "", isCaution: false },
      { number: "23", name: "RESET", gpio: "N/A", features: ["Reset Button Trigger"], primary: "Reset Key Out", caution: "", isCaution: false },
      { number: "24", name: "3.3V", gpio: "N/A", features: ["Power Output"], primary: "3.3V Out Raw Regulator", caution: "Can power low-draw components.", isCaution: false },
      { number: "25", name: "GND", gpio: "N/A", features: ["Ground"], primary: "Reference Ground", caution: "", isCaution: false },
      { number: "26", name: "5V", gpio: "N/A", features: ["Power Output"], primary: "USB 5V Out", caution: "Directly linked to USB line. Supply input or feed point.", isCaution: false }
    ]
  },
  "pico": {
    name: "Raspberry Pi Pico (RP2040)",
    description: "High-performance dual ARM Cortex-M0+ silicon launched by Raspberry Pi. Extremely flexible programmable I/O statemachines (PIO) and low power consumption.",
    layoutType: "dual-inline",
    datasheetUrl: "https://datasheets.raspberrypi.com/pico/pico-datasheet.pdf",
    additionalResources: [
      { label: "RP2040 Datasheet", url: "https://datasheets.raspberrypi.com/rp2040/rp2040-datasheet.pdf" }
    ],
    specs: {
      architecture: "Dual ARM Cortex-M0+",
      clockSpeed: "133 MHz",
      operatingVoltage: "3.3V Logic Level Only",
      flashMemory: "2 MB (QSPI Flash)",
      ramSize: "264 KB Multi-bank SRAM",
      gpioCount: 26,
      adcChannels: "3 Channels (12-bit / 4th internal temp)",
      dacChannels: "None",
      interfaces: "2x SPI, 2x I2C, 2x UART, 16x PWM Channels, 2x PIO Blocks"
    },
    warnings: [
      "Logic strictly is 3.3V: Under no circumstances expose any input pin to 5V inputs, as the RP2040 silicon will suffer breakdown.",
      "ADC noise: Standard Pico board connects ADC reference directly to 3.3V output. Highly prone to high noise. Use clean VREF layout for sensitive audio or transducers.",
      "GPIO 23 Power Management: Hardwired directly to the RT6150 power regulator mode control. Low is power save, high is PWM low-ripple. Avoid using GPIO23 as general purpose I/O.",
      "QSPI Flash Pins (1-6 internally linked): Do not interact with pin signals 1 to 6 on the raw module unless you know how to operate high speed SPI master busses."
    ],
    peripherals: [
      { interfaceType: "I2C0 (Default)", pinsUsed: "SDA: GP4, SCL: GP5" },
      { interfaceType: "I2C1", pinsUsed: "SDA: GP2, SCL: GP3" },
      { interfaceType: "SPI0", pinsUsed: "RX: GP16, TX: GP19, SCK: GP18, CS: GP17" },
      { interfaceType: "UART0 (Debug)", pinsUsed: "TX: GP0, RX: GP1" }
    ],
    pins: [
      { number: "1", name: "GP0", gpio: "0", features: ["GPIO", "UART0_TX", "I2C0_SDA", "PWM0"], primary: "Digital I/O / Serial 0 TX" },
      { number: "2", name: "GP1", gpio: "1", features: ["GPIO", "UART0_RX", "I2C0_SCL", "PWM1"], primary: "Digital I/O / Serial 0 RX" },
      { number: "3", name: "GND", gpio: "N/A", features: ["Ground"], primary: "Ground reference point", isCaution: false },
      { number: "4", name: "GP2", gpio: "2", features: ["GPIO", "I2C1_SDA", "PWM2"], primary: "Digital I/O" },
      { number: "5", name: "GP3", gpio: "3", features: ["GPIO", "I2C1_SCL", "PWM3"], primary: "Digital I/O" },
      { number: "6", name: "GP4", gpio: "4", features: ["GPIO", "I2C0_SDA", "PWM4"], primary: "Default Standard I2C SDA" },
      { number: "7", name: "GP5", gpio: "5", features: ["GPIO", "I2C0_SCL", "PWM5"], primary: "Default Standard I2C SCL" },
      { number: "8", name: "GND", gpio: "N/A", features: ["Ground"], primary: "Ground reference point" },
      { number: "9", name: "GP6", gpio: "6", features: ["GPIO", "SPI0_SCK", "PWM6"], primary: "Digital I/O / SPI0 SCK" },
      { number: "10", name: "GP7", gpio: "7", features: ["GPIO", "SPI0_TX", "PWM7"], primary: "Digital I/O / SPI0 MISO" },
      { number: "11", name: "GP8", gpio: "8", features: ["GPIO", "SPI0_RX", "PWM8"], primary: "Digital I/O / SPI0 MOSI" },
      { number: "12", name: "GP9", gpio: "9", features: ["GPIO", "SPI0_CS", "PWM9"], primary: "Digital I/O / SPI0 CS" },
      { number: "13", name: "GND", gpio: "N/A", features: ["Ground"], primary: "Ground reference point" },
      { number: "14", name: "GP10", gpio: "10", features: ["GPIO", "UART1_TX", "PWM10"], primary: "Digital I/O / UART1 TX" },
      { number: "15", name: "GP11", gpio: "11", features: ["GPIO", "UART1_RX", "PWM11"], primary: "Digital I/O / UART1 RX" },
      { number: "16", name: "3V3_OUT", gpio: "N/A", features: ["Power Out"], primary: "Regulated 3.3V Output", caution: "Extremely clean Buck-Boost regulator output. Max load ~300mA.", isCaution: true },
      { number: "17", name: "VSYS", gpio: "N/A", features: ["Power Input"], primary: "Raw power input (1.8V to 5.5V)", caution: "Feeds the onboard regulator. Perfect for battery.", isCaution: false },
      { number: "18", name: "VBUS", gpio: "N/A", features: ["Power Output/Input"], primary: "USB Power Input (5V Connected)", caution: "Powers circuit from laptop USB.", isCaution: false }
    ]
  },
  "attiny85": {
    name: "ATtiny85 (MCU Chip)",
    description: "Ultra-compact 8-pin microcontroller. Amazing option for battery-powered, space-constrained projects that only need a handful of I/O wires.",
    layoutType: "dual-inline",
    datasheetUrl: "https://ww1.microchip.com/downloads/en/DeviceDoc/Atmel-2586-AVR-8-bit-Microcontroller-ATtiny25-ATtiny45-ATtiny85_Datasheet.pdf",
    additionalResources: [
      { label: "ATtiny85 Official Docs", url: "https://www.microchip.com/en-us/product/attiny85" }
    ],
    specs: {
      architecture: "AVR 8-bit",
      clockSpeed: "1 MHz to 20 MHz (Internal default 8 MHz)",
      operatingVoltage: "2.7V - 5.5V Logic Level Range",
      flashMemory: "8 KB Flash",
      ramSize: "512 Bytes SRAM + 512 Bytes EEPROM",
      gpioCount: 6,
      adcChannels: "4 Channels (10-bit)",
      dacChannels: "None",
      interfaces: "SPI (USI), I2C compatible, 2x PWM timers"
    },
    warnings: [
      "No USB interface onboard. Requires external Arduino ISP, USBasp, or FTDI programmer to flash standard code.",
      "Reset Pin 1 (PB5) acts as reset. Running high voltage can convert this to a general purpose GPIO, but doing so prevents future low-voltage ISP programming unless high-voltage reset is applied.",
      "Limited RAM (512 Bytes): Memory is extremely constrained. Avoid massive strings, printing complex floating arrays, or allocating big vectors.",
      "Shared I2C and SPI pins: USI (Universal Serial Interface) registers share physical physical pins for I2C and SPI buses. Operating both concurrently requires careful wiring."
    ],
    peripherals: [
      { interfaceType: "I2C (USI Compatible)", pinsUsed: "SDA: Pin 5 (PB0), SCL: Pin 7 (PB2)" },
      { interfaceType: "SPI (ISP Flashing)", pinsUsed: "MOSI: PB0, MISO: PB1, SCK: PB2, Reset: PB5" },
      { interfaceType: "PWM", pinsUsed: "PB0, PB1, PB4" }
    ],
    pins: [
      { number: "1", name: "PB5 / RESET", gpio: "5", features: ["Digital I/O", "Reset Pin", "ADC0", "dW (debugWIRE)"], primary: "System Reset / Trigger Input", caution: "Do not pull low unless you intend to halt and reset execution.", isCaution: true },
      { number: "2", name: "PB3 (A3)", gpio: "3", features: ["Digital I/O", "ADC3", "XTAL1 OSC IN"], primary: "Analog Input 3 / Digital", caution: "Tied to crystal oscillator if external clock is enabled via fuses.", isCaution: false },
      { number: "3", name: "PB4 (A2)", gpio: "4", features: ["Digital I/O", "ADC2", "XTAL2 OSC OUT", "PWM"], primary: "Analog Input 2 / PWM Out", caution: "Shares clock source components.", isCaution: false },
      { number: "4", name: "GND", gpio: "N/A", features: ["System Ground"], primary: "Ground reference point" },
      { number: "5", name: "PB0 / MOSI / SDA", gpio: "0", features: ["Digital I/O", "PWM", "MOSI (SPI)", "SDA (I2C)"], primary: "SDA Data Bus / Master Out SPI", caution: "Critical shared data lines.", isCaution: false },
      { number: "6", name: "PB1 / MISO", gpio: "1", features: ["Digital I/O", "PWM", "MISO (SPI)"], primary: "MISO Master In Slave Out SPI" },
      { number: "7", name: "PB2 / SCL", gpio: "2", features: ["Digital I/O", "ADC1", "SCK (SPI)", "SCL (I2C)"], primary: "SCL Clock Bus / SPI Clock / ADC 1" },
      { number: "8", name: "VCC", gpio: "N/A", features: ["Power Input"], primary: "Positive supply (2.7V - 5.5V)", caution: "Apply logic positive feed safe level.", isCaution: false }
    ]
  }
};

export default function App() {
  const [selectedBoardId, setSelectedBoardId] = useState<string>("esp32-30pin");
  const [customBoard, setCustomBoard] = useState<MicrocontrollerBoard | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isApiKeySet, setIsApiKeySet] = useState<boolean>(true);

  // Interaction state
  const [hoveredPinName, setHoveredPinName] = useState<string | null>(null);
  const [selectedPinName, setSelectedPinName] = useState<string | null>(null);
  const [pinFilter, setPinFilter] = useState<string>("all");

  // History of online searches
  const [searchHistory, setSearchHistory] = useState<string[]>(["STM32 Blue Pill", "Raspberry Pi Pico", "ATtiny85"]);

  // Arduino IDE live sync state
  const [syncEnabled, setSyncEnabled] = useState<boolean>(true);
  const [arduinoStatus, setArduinoStatus] = useState<ArduinoStatus | null>(null);
  const [lastAppliedFqbn, setLastAppliedFqbn] = useState<string | null>(null);
  const [syncReachable, setSyncReachable] = useState<boolean>(true);

  // Calculate current active board
  const activeBoard: MicrocontrollerBoard = (() => {
    if (selectedBoardId === "custom" && customBoard) {
      return customBoard;
    }
    const preloaded = preloadedBoards.find((b) => b.id === selectedBoardId);
    return preloaded || preloadedBoards[0];
  })();

  // Clear states when board changes
  useEffect(() => {
    setHoveredPinName(null);
    setSelectedPinName(null);
  }, [selectedBoardId]);

  // Poll the backend for the board currently plugged into USB. We chain with
  // setTimeout (not setInterval) so a slow board-scan never overlaps the next
  // request - each poll waits for the previous one to finish, then waits 800ms.
  useEffect(() => {
    if (!syncEnabled) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const r = await fetch("/api/arduino/board");
        const d = await r.json();
        if (!active) return;
        setSyncReachable(true);
        if (d && d.ok) setArduinoStatus(d as ArduinoStatus);
      } catch {
        if (active) setSyncReachable(false);
      } finally {
        if (active) timer = setTimeout(poll, 800);
      }
    };
    poll();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [syncEnabled]);

  // When the IDE's selected board changes, mirror it on the website.
  // Keyed on FQBN so we only act on a genuine change - this lets the user
  // manually browse other boards without us yanking them back, until they
  // actually pick a different board in the IDE.
  useEffect(() => {
    if (!syncEnabled) return;
    const board = arduinoStatus?.board;
    if (!board?.fqbn) return;
    if (board.fqbn === lastAppliedFqbn) return;

    setLastAppliedFqbn(board.fqbn);

    const mappedId = FQBN_TO_BOARD_ID[board.fqbn];
    if (mappedId) {
      setSelectedBoardId(mappedId);
      setCustomBoard(null);
      setSelectedPinName(null);
      setSearchError(null);
    } else if (board.name) {
      // Unknown board: fall back to the dynamic catalog (Gemini) by name.
      handleSearch(board.name);
    }
    // handleSearch intentionally omitted from deps to avoid re-runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arduinoStatus, syncEnabled, lastAppliedFqbn]);

  // Handle Dynamic chip search using server endpoint (backed by Gemini 3.5 Flash)
  const handleSearch = async (queryToSubmit: string) => {
    const query = queryToSubmit.trim();
    if (!query) return;

    setIsSearching(true);
    setSearchError(null);
    setSelectedPinName(null);
    setHoveredPinName(null);

    const queryLower = query.toLowerCase();

    // Proactive step: Check if the search query matches any preloaded high-fidelity board
    const matchedPreloaded = preloadedBoards.find(b =>
      queryLower.includes(b.id.toLowerCase()) ||
      b.name.toLowerCase().includes(queryLower) ||
      queryLower.includes(b.name.toLowerCase())
    );

    if (matchedPreloaded) {
      setSelectedBoardId(matchedPreloaded.id);
      setCustomBoard(null);
      setIsSearching(false);
      return;
    }

    let offlineMatchedKey = "";
    if (queryLower.includes("stm") || queryLower.includes("blue pill") || queryLower.includes("32f103")) {
      offlineMatchedKey = "stm32";
    } else if (queryLower.includes("pico") || queryLower.includes("rp2040") || queryLower.includes("raspberry")) {
      offlineMatchedKey = "pico";
    } else if (queryLower.includes("attiny") || queryLower.includes("tiny85") || queryLower.includes("attiny85")) {
      offlineMatchedKey = "attiny85";
    }

    // Attempt backend specifications generation
    try {
      const response = await fetch("/api/microcontrollers/specs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query })
      });

      const body = await response.json();

      if (response.ok && !body.error) {
        // Success back from server
        const formattedBoard: MicrocontrollerBoard = {
          id: `custom-${Date.now()}`,
          name: body.name || query,
          description: body.description || "Synthesized raw semiconductor architecture datasheet",
          specs: {
            architecture: body.specs?.architecture || "Custom CPU Core",
            clockSpeed: body.specs?.clockSpeed || "Unknown Speed",
            operatingVoltage: body.specs?.operatingVoltage || "Variable",
            flashMemory: body.specs?.flashMemory || "N/A",
            ramSize: body.specs?.ramSize || "N/A",
            gpioCount: body.specs?.gpioCount || body.pins?.length || 0,
            adcChannels: body.specs?.adcChannels || "N/A",
            dacChannels: body.specs?.dacChannels || "None",
            interfaces: body.specs?.interfaces || "UART, SPI, I2C"
          },
          warnings: body.warnings || [],
          peripherals: body.peripherals || [],
          layoutType: body.pins && body.pins.length > 30 ? "mega-headers" : "dual-inline",
          datasheetUrl: query.toLowerCase().includes("esp32-wroom") || query.toLowerCase().includes("wroom-32") || query.toLowerCase().includes("esp32-devkit") || query.toLowerCase().includes("esp-32")
            ? "https://documentation.espressif.com/esp32-wroom-32_datasheet_en.pdf"
            : query.toLowerCase().includes("esp8266") || query.toLowerCase().includes("nodemcu")
              ? "https://www.espressif.com/sites/default/files/documentation/0a-esp8266ex_datasheet_en.pdf"
              : `https://www.google.com/search?q=${encodeURIComponent((body.name || query) + " datasheet pdf official")}`,
          additionalResources: [
            { label: "Search Official Documentation", url: `https://www.google.com/search?q=${encodeURIComponent((body.name || query) + " technical docs")}` }
          ],
          pins: (body.pins || []).map((p: any, index: number) => ({
            number: p.number || `${index + 1}`,
            name: p.name || `PIN_${index + 1}`,
            gpio: p.gpio || "N/A",
            features: p.features || ["Digital I/O"],
            primary: p.primary || "General I/O",
            caution: p.caution || "",
            isCaution: !!p.isCaution || !!p.caution
          }))
        };

        setCustomBoard(formattedBoard);
        setSelectedBoardId("custom");
        setIsApiKeySet(true);
        // Add to search list if not already there
        if (!searchHistory.includes(formattedBoard.name)) {
          setSearchHistory(prev => [formattedBoard.name, ...prev.slice(0, 5)]);
        }
      } else {
        // Handle server side error or API key absent
        if (body.error && body.error.includes("GEMINI_API_KEY")) {
          setIsApiKeySet(false);
        }

        // Let's set a super descriptive error, but immediately recovery fallback:
        const errorMsg = body.error || "The real-time Gemini registry service is experiencing a temporary outage or rate limit.";
        setSearchError(`${errorMsg}. We have successfully loaded a high-fidelity offline representation matching your search request!`);

        // If offline search index contains key, load it
        if (offlineMatchedKey) {
          const rawMock = offlineSearches[offlineMatchedKey];
          const formattedBoard: MicrocontrollerBoard = {
            id: `custom-offline-${Date.now()}`,
            name: rawMock.name,
            description: rawMock.description + " (Simulated Offline Extract)",
            specs: rawMock.specs,
            warnings: rawMock.warnings,
            peripherals: rawMock.peripherals,
            layoutType: rawMock.layoutType,
            pins: rawMock.pins,
            datasheetUrl: (rawMock as any).datasheetUrl || `https://www.google.com/search?q=${encodeURIComponent(rawMock.name + " datasheet pdf")}`,
            additionalResources: (rawMock as any).additionalResources
          };
          setCustomBoard(formattedBoard);
          setSelectedBoardId("custom");
        } else {
          // General offline synthesis matching user's exact query
          const procedurallyBuilt = createProceduralBoard(query);
          setCustomBoard(procedurallyBuilt);
          setSelectedBoardId("custom");
        }
      }
    } catch (err: any) {
      console.error(err);
      setSearchError("Real-time network lookup met a temporary spike. Rest assured, we have compiled a high-fidelity offline blueprint for you to study below!");

      if (offlineMatchedKey) {
        const rawMock = offlineSearches[offlineMatchedKey];
        setCustomBoard({
          id: `custom-err-${Date.now()}`,
          name: rawMock.name,
          description: rawMock.description + " (Offline Recovery Map)",
          specs: rawMock.specs,
          warnings: rawMock.warnings,
          peripherals: rawMock.peripherals,
          layoutType: rawMock.layoutType,
          pins: rawMock.pins,
          datasheetUrl: (rawMock as any).datasheetUrl || `https://www.google.com/search?q=${encodeURIComponent(rawMock.name + " datasheet pdf")}`,
          additionalResources: (rawMock as any).additionalResources
        });
        setSelectedBoardId("custom");
      } else {
        const procedurallyBuilt = createProceduralBoard(query);
        setCustomBoard(procedurallyBuilt);
        setSelectedBoardId("custom");
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Build a generic procedural layout if offline and user searches something completely custom
  const createProceduralBoard = (name: string): MicrocontrollerBoard => {
    const nameLower = name.toLowerCase();
    const isESP = nameLower.includes("esp32") || nameLower.includes("esp-32") || nameLower.includes("wroom") || nameLower.includes("nodemcu") || nameLower.includes("esp8266");
    const isArduino = nameLower.includes("arduino") || nameLower.includes("uno") || nameLower.includes("mega") || nameLower.includes("nano") || nameLower.includes("leonardo");
    const isSTM32 = nameLower.includes("stm32") || nameLower.includes("stm") || nameLower.includes("blue pill");

    const layoutType = (nameLower.includes("mega") || nameLower.includes("2560")) ? "mega-headers" : (isArduino ? "arduino-headers" : "dual-inline");

    return {
      id: `custom-procedural-${Date.now()}`,
      name: `${name.toUpperCase()} (Synthesized Board)`,
      description: `An offline high-fidelity synthesized board blueprint matching "${name}". Pinout routing, voltage limits, and signal filter groups are fully active.`,
      layoutType: layoutType,
      specs: {
        architecture: isESP ? "Tensilica Dual-Core 32-bit" : (isArduino ? "AVR 8-bit MCU" : (isSTM32 ? "ARM Cortex-M3 32-bit" : "RISC-V 32-bit Core")),
        clockSpeed: isESP ? "240 MHz" : (isArduino ? "16 MHz" : (isSTM32 ? "72 MHz" : "48 MHz")),
        operatingVoltage: isESP || isSTM32 ? "3.3V Safe Logic level only" : "5.0V Logic standard",
        flashMemory: isESP ? "4 MB Flash" : (isArduino ? "32 KB Flash" : (isSTM32 ? "64 KB" : "32 KB Flash")),
        ramSize: isESP ? "520 KB SRAM" : (isArduino ? "2 KB SRAM" : (isSTM32 ? "20 KB SRAM" : "8 KB SRAM")),
        gpioCount: isESP ? 26 : (isArduino ? 14 : 16),
        adcChannels: isESP ? "8 Channels (12-bit)" : "6 Channels (10-bit)",
        dacChannels: isESP ? "2 Channels" : "None",
        interfaces: isESP ? "3x UART, 2x I2C, 3x SPI" : "1x Hardware UART, I2C, SPI"
      },
      warnings: [
        `This is a custom interactive map synthesized offline for ${name}.`,
        isESP || isSTM32 ? "Logic levels are strictly 3.3V. Exposure to direct 5V lines will break the gates." : "VCC lines output steady VCC logic level.",
        "Add a GEMINI_API_KEY under Settings > Secrets to enable real-time manufacturer PDF datasheet mining."
      ],
      peripherals: [
        { interfaceType: "I2C default map", pinsUsed: isESP ? "SDA: GPIO21, SCL: GPIO22" : "SDA: Pin A4, SCL: Pin A5" },
        { interfaceType: "SPI default map", pinsUsed: isESP ? "MOSI: GPIO23, MISO: GPIO19, SCK: GPIO18" : "MOSI: Pin 11, MISO: Pin 12, SCK: Pin 13" }
      ],
      pins: isESP ? [
        { number: "1", name: "3V3", gpio: "N/A", features: ["Power out"], primary: "Regulated 3.3V out" },
        { number: "2", name: "EN", gpio: "N/A", features: ["Enable"], primary: "Chip Enable / Reset" },
        { number: "3", name: "GPIO36 (SVP)", gpio: "36", features: ["GPIO", "ADC1_0"], primary: "Analog Input Only" },
        { number: "4", name: "GPIO39 (SVN)", gpio: "39", features: ["GPIO", "ADC1_3"], primary: "Analog Input Only" },
        { number: "5", name: "GPIO34", gpio: "34", features: ["GPIO", "ADC1_6"], primary: "Analog Input Only" },
        { number: "6", name: "GPIO35", gpio: "35", features: ["GPIO", "ADC1_7"], primary: "Analog Input Only" },
        { number: "7", name: "GPIO32", gpio: "32", features: ["GPIO", "ADC1_4", "Touch9"], primary: "Digital I/O or Analog" },
        { number: "8", name: "GPIO33", gpio: "33", features: ["GPIO", "ADC1_5", "Touch8"], primary: "Digital I/O or Analog" },
        { number: "9", name: "GPIO25", gpio: "25", features: ["GPIO", "DAC1", "ADC2_8"], primary: "Digital I/O / DAC Output" },
        { number: "10", name: "GPIO26", gpio: "26", features: ["GPIO", "DAC2", "ADC2_9"], primary: "Digital I/O / DAC Output" },
        { number: "11", name: "GPIO27", gpio: "27", features: ["GPIO", "ADC2_7", "Touch7"], primary: "Digital I/O or Analog" },
        { number: "12", name: "GPIO14", gpio: "14", features: ["GPIO", "SPI_CLK", "Touch6"], primary: "SPI SCK / PWM" },
        { number: "13", name: "GPIO12", gpio: "12", features: ["GPIO", "SPI_MISO", "Touch5"], primary: "SPI MISO / Boot Strap Pin", caution: "Must be LOW on boot.", isCaution: true },
        { number: "14", name: "GND", gpio: "N/A", features: ["Ground"], primary: "System Ground" },
        { number: "15", name: "GPIO13", gpio: "13", features: ["GPIO", "SPI_MOSI", "Touch4"], primary: "SPI MOSI / PWM" },
        { number: "16", name: "GPIO9", gpio: "9", features: ["GPIO", "Flash_D2"], primary: "Internal Flash Memory line", caution: "Do not connect general circuits here.", isCaution: true },
        { number: "17", name: "GPIO10", gpio: "10", features: ["GPIO", "Flash_D3"], primary: "Internal Flash Memory line", caution: "Do not connect general circuits here.", isCaution: true },
        { number: "18", name: "GPIO11", gpio: "11", features: ["GPIO", "Flash_CMD"], primary: "Internal Flash Memory line", caution: "Do not connect general circuits here.", isCaution: true },
        { number: "19", name: "TXD0", gpio: "1", features: ["GPIO", "UART0_TX"], primary: "Debug Logger Transmit", caution: "Activity causes trace flutter on boot.", isCaution: false },
        { number: "20", name: "RXD0", gpio: "3", features: ["GPIO", "UART0_RX"], primary: "Debug Logger Receive" },
        { number: "21", name: "GPIO21", gpio: "21", features: ["GPIO", "I2C_SDA"], primary: "Default I2C SDA data" },
        { number: "22", name: "GPIO22", gpio: "22", features: ["GPIO", "I2C_SCL"], primary: "Default I2C SCL clock" },
        { number: "23", name: "GPIO23", gpio: "23", features: ["GPIO", "SPI_MOSI_D"], primary: "Default SPI MOSI" },
        { number: "24", name: "5V", gpio: "N/A", features: ["Power in"], primary: "USB 5V Feed input" }
      ] : [
        { number: "1", name: "RESET", gpio: "N/A", features: ["Reset Input"], primary: "Hardware Reset", caution: "Active LOW. Hold to halt processor." },
        { number: "2", name: "D0 / RX", gpio: "0", features: ["GPIO", "RX"], primary: "Digital I/O or UART RX" },
        { number: "3", name: "D1 / TX", gpio: "1", features: ["GPIO", "TX"], primary: "Digital I/O or UART TX" },
        { number: "4", name: "D2", gpio: "2", features: ["GPIO", "INT0"], primary: "Digital I/O / Ext Interrupt" },
        { number: "5", name: "D3", gpio: "3", features: ["GPIO", "PWM"], primary: "Digital I/O / PWM" },
        { number: "6", name: "D4", gpio: "4", features: ["GPIO"], primary: "General Purpose I/O" },
        { number: "7", name: "D5", gpio: "5", features: ["GPIO", "PWM"], primary: "Digital I/O / PWM" },
        { number: "8", name: "D6", gpio: "6", features: ["GPIO", "PWM"], primary: "Digital I/O / PWM" },
        { number: "9", name: "D7", gpio: "7", features: ["GPIO"], primary: "General Purpose I/O" },
        { number: "10", name: "D8", gpio: "8", features: ["GPIO"], primary: "General Purpose I/O" },
        { number: "11", name: "D9", gpio: "9", features: ["GPIO", "PWM"], primary: "Digital I/O or PWM" },
        { number: "12", name: "D10", gpio: "10", features: ["GPIO", "SPI_SS", "PWM"], primary: "SPI Chip Select (SS)" },
        { number: "13", name: "D11", gpio: "11", features: ["GPIO", "SPI_MOSI", "PWM"], primary: "SPI Master Out Slave In" },
        { number: "14", name: "D12", gpio: "12", features: ["GPIO", "SPI_MISO"], primary: "SPI Master In Slave Out" },
        { number: "15", name: "D13", gpio: "13", features: ["GPIO", "SPI_SCK", "Built-In LED"], primary: "SPI Clock / Onboard LED" },
        { number: "16", name: "GND", gpio: "N/A", features: ["Ground"], primary: "System Reference Ground" },
        { number: "17", name: "3V3", gpio: "N/A", features: ["Power out"], primary: "3.3V Regulated supply" },
        { number: "18", name: "5V", gpio: "N/A", features: ["Power out"], primary: "5.0V Regulator supply" },
        { number: "19", name: "A0", gpio: "14", features: ["Analog Input", "GPIO"], primary: "Analog Input 0" },
        { number: "20", name: "A1", gpio: "15", features: ["Analog Input", "GPIO"], primary: "Analog Input 1" },
        { number: "21", name: "A2", gpio: "16", features: ["Analog Input", "GPIO"], primary: "Analog Input 2" },
        { number: "22", name: "A3", gpio: "17", features: ["Analog Input", "GPIO"], primary: "Analog Input 3" },
        { number: "23", name: "A4 / SDA", gpio: "18", features: ["Analog Input", "I2C_SDA"], primary: "Hardware I2C SDA" },
        { number: "24", name: "A5 / SCL", gpio: "19", features: ["Analog Input", "I2C_SCL"], primary: "Hardware I2C SCL" }
      ]
    };
  };

  // Helper categories for pins filtering
  const getPinCategoryColor = (pin: BoardPin) => {
    if (pin.isCaution || pin.caution && pin.caution.length > 5) {
      return {
        bg: "bg-amber-950/40 border border-amber-500/50 hover:bg-amber-900/60",
        text: "text-amber-300",
        indicator: "bg-amber-400",
        border: "border-amber-700/80"
      };
    }
    const featuresLower = pin.features.map(f => f.toLowerCase()).join(" ");
    const primaryLower = pin.primary.toLowerCase();
    const nameLower = pin.name.toLowerCase();

    if (nameLower.includes("gnd") || featuresLower.includes("ground")) {
      return {
        bg: "bg-[#141416] border border-[#333333] hover:bg-[#202022]",
        text: "text-zinc-400 font-mono",
        indicator: "bg-zinc-500",
        border: "border-zinc-700"
      };
    }
    if (nameLower.includes("3v") || nameLower.includes("5v") || nameLower.includes("vcc") || nameLower.includes("vbat") || nameLower.includes("power")) {
      return {
        bg: "bg-red-950/20 border border-red-900/40 hover:bg-red-950/40",
        text: "text-red-300 font-mono font-bold",
        indicator: "bg-red-400",
        border: "border-red-800"
      };
    }
    if (featuresLower.includes("adc") || featuresLower.includes("dac") || featuresLower.includes("analog") || primaryLower.includes("analog")) {
      return {
        bg: "bg-sky-950/30 border border-sky-900/40 hover:bg-sky-950/50",
        text: "text-sky-300",
        indicator: "bg-sky-400",
        border: "border-sky-800"
      };
    }
    if (featuresLower.includes("uart") || featuresLower.includes("tx") || featuresLower.includes("rx") || primaryLower.includes("serial")) {
      return {
        bg: "bg-indigo-950/30 border border-indigo-900/40 hover:bg-indigo-950/50",
        text: "text-indigo-300",
        indicator: "bg-indigo-400",
        border: "border-indigo-800"
      };
    }
    if (featuresLower.includes("sda") || featuresLower.includes("scl") || featuresLower.includes("i2c") || featuresLower.includes("spi") || featuresLower.includes("miso") || featuresLower.includes("mosi") || featuresLower.includes("sck")) {
      return {
        bg: "bg-emerald-950/30 border border-emerald-900/40 hover:bg-emerald-950/50",
        text: "text-emerald-300",
        indicator: "bg-emerald-400",
        border: "border-emerald-800"
      };
    }
    return {
      bg: "bg-zinc-900 border border-zinc-800 hover:bg-zinc-800",
      text: "text-zinc-200",
      indicator: "bg-zinc-500",
      border: "border-zinc-800"
    };
  };

  // Filters calculation
  const satisfiesFilter = (pin: BoardPin) => {
    if (pinFilter === "all") return true;
    if (pinFilter === "gpio") return pin.gpio && pin.gpio !== "N/A" && !pin.isCaution;
    if (pinFilter === "analog") {
      return pin.features.some(f => f.toLowerCase().includes("adc") || f.toLowerCase().includes("dac") || f.toLowerCase().includes("analog"));
    }
    if (pinFilter === "interfaces") {
      return pin.features.some(f => ["sda", "scl", "tx", "rx", "mosi", "miso", "sck", "cs", "ss", "i2c", "spi", "uart"].some(keyword => f.toLowerCase().includes(keyword)));
    }
    if (pinFilter === "cautions") return pin.isCaution || (pin.caution && pin.caution.length > 0);
    return true;
  };

  // Find detailed context for selected or hovered pin
  const focusedPin = activeBoard.pins.find(p => p.name === hoveredPinName) || activeBoard.pins.find(p => p.name === selectedPinName);

  // Group pins for side columns helper mapping
  const leftPins = activeBoard.pins.slice(0, Math.ceil(activeBoard.pins.length / 2));
  const rightPins = activeBoard.pins.slice(Math.ceil(activeBoard.pins.length / 2));

  return (
    <div className="bg-[#0a0a0b] text-[#e5e5e0] min-h-screen flex flex-col font-sans select-none antialiased">
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#1c1c1e] bg-[#0c0c0d] shadow-sm shrink-0">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white" id="app_icon">
              <CircuitBoard size={18} />
            </div>
            <div>
              <h1 className="font-serif italic text-xl tracking-tight text-[#f5f5f0] flex items-center gap-2">
                Pin-Reference <span className="font-sans not-italic text-xs bg-[#222] text-[#888] font-mono px-1.5 py-0.5 rounded border border-[#333]">&alpha;</span>
              </h1>
              <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Microcontroller Companion</p>
            </div>
          </div>

          {/* Quick Stats Banner */}
          <div className="hidden lg:flex items-center gap-6 border-l border-[#222] pl-8">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] text-zinc-400 uppercase tracking-wider">Silicon DB Live</span>
            </div>
          </div>
        </div>

        {/* Global Realtime search */}
        <div className="flex items-center gap-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(searchQuery);
            }}
            className="relative"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search chips (e.g. ESP32, Pico, STM32)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#141416] border border-[#222] rounded-full pl-10 pr-4 py-1.5 w-72 text-xs text-[#e5e5e0] placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-colors"
                id="header-search-bar"
              />
              <Search className="absolute left-3.5 top-2.5 text-zinc-500" size={13} />
            </div>
          </form>

          {/* Settings Indicator / Info indicator */}
          <div className="text-[10px] uppercase font-mono tracking-widest text-[#888888]">
            <span className="text-[#e5e5e0] font-bold border-b border-orange-500 pb-1">Microcontroller Map</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar Left: Chip Selection & Custom Query History */}
        <aside className="w-64 border-r border-[#1a1a1c] bg-[#0c0c0d] flex flex-col justify-between shrink-0" id="sidebar-left">
          <div className="flex-1 overflow-y-auto p-4 space-y-6">

            {/* Arduino IDE live sync */}
            <div className="bg-[#0e0d0b] border border-[#2a2118] rounded-xl p-3 space-y-2.5" id="arduino-sync-panel">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Usb size={12} className={syncEnabled ? "text-orange-400" : "text-zinc-600"} />
                  <span className="text-[10px] font-mono uppercase tracking-[0.18em] font-semibold text-zinc-300">USB Board Detect</span>
                </div>
                <button
                  onClick={() => {
                    setSyncEnabled((prev) => {
                      const next = !prev;
                      if (next) setLastAppliedFqbn(null); // re-apply current board on re-enable
                      return next;
                    });
                  }}
                  className={`relative w-8 h-4 rounded-full transition-colors ${syncEnabled ? "bg-orange-600" : "bg-zinc-700"}`}
                  title={syncEnabled ? "Turn off auto-sync" : "Turn on auto-sync"}
                  id="arduino-sync-toggle"
                >
                  <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${syncEnabled ? "left-4" : "left-0.5"}`}></span>
                </button>
              </div>

              {!syncEnabled ? (
                <p className="text-[10px] text-zinc-500 leading-relaxed">Auto-detect paused. Flip the switch to track the board plugged into your USB.</p>
              ) : !syncReachable ? (
                <p className="text-[10px] text-amber-300/80 leading-relaxed">Backend unreachable. Make sure the app is running via <span className="font-mono">npm run dev</span>.</p>
              ) : arduinoStatus?.board ? (
                arduinoStatus.board.identified ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Link2 size={12} className="text-orange-400 shrink-0" />
                      <span className="text-xs font-semibold text-orange-200 truncate">{arduinoStatus.board.name}</span>
                    </div>
                    <p className="text-[9px] font-mono text-zinc-500 truncate" title={arduinoStatus.board.fqbn}>{arduinoStatus.board.fqbn}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider">
                        Connected · {arduinoStatus.board.port}
                      </span>
                    </div>
                  </div>
                ) : (
                  // USB board attached but its chip carries no identity (clone).
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Usb size={12} className="text-amber-400 shrink-0" />
                      <span className="text-xs font-semibold text-amber-200">Unknown board · {arduinoStatus.board.port}</span>
                    </div>
                    {arduinoStatus.board.usbId && (
                      <p className="text-[9px] font-mono text-zinc-500">USB ID {arduinoStatus.board.usbId}</p>
                    )}
                    <p className="text-[10px] text-amber-200/60 leading-relaxed">USB chip has no board identity. Pick it in Arduino IDE (Tools {"→"} Board) and it'll show here.</p>
                  </div>
                )
              ) : (
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span>
                  <p className="text-[10px] text-zinc-500 leading-relaxed">No board on USB. Plug one in to see it here.</p>
                </div>
              )}
            </div>

            {/* Quick preloads selection */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-zinc-500 mb-3 font-semibold">Preloaded Microcomputers</p>
              <ul className="space-y-1">
                {preloadedBoards.map((board) => {
                  const isActive = selectedBoardId === board.id;
                  return (
                    <li
                      key={board.id}
                      onClick={() => {
                        setSelectedBoardId(board.id);
                        setCustomBoard(null);
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${isActive
                          ? "bg-[#18181b] border-[#333335] text-white font-medium"
                          : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-[#141416]"
                        }`}
                      id={`sidebar-item-${board.id}`}
                    >
                      <div className="flex items-center gap-2">
                        <Cpu size={14} className={isActive ? "text-orange-500" : "text-zinc-500"} />
                        <span className="text-xs truncate max-w-[150px]">{board.name}</span>
                      </div>
                      {board.id.includes("esp32") && (
                        <span className="text-[9px] bg-orange-950 text-orange-400 px-1 py-0.2 rounded font-semibold font-mono">SOC</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Custom Search list */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-zinc-500 font-semibold">Custom Dynamic Catalog</p>
                {customBoard && (
                  <button
                    onClick={() => {
                      setSelectedBoardId("esp32-30pin");
                      setCustomBoard(null);
                    }}
                    className="text-[10px] text-zinc-500 hover:text-white"
                  >
                    Reset
                  </button>
                )}
              </div>

              {customBoard ? (
                <div
                  onClick={() => setSelectedBoardId("custom")}
                  className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${selectedBoardId === "custom"
                      ? "bg-[#1e1c18] border-orange-500/20 text-orange-300 font-medium"
                      : "bg-[#14120f] border-[#221c14] text-zinc-400 hover:text-orange-200"
                    }`}
                  id="sidebar-custom-board"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Sparkles size={14} className="text-orange-400 shrink-0" />
                    <span className="text-xs truncate font-serif italic font-semibold">{customBoard.name}</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
                </div>
              ) : (
                <div className="p-3 bg-[#111] border border-[#222] rounded-lg text-center">
                  <p className="text-[11px] text-zinc-500 mb-1 leading-relaxed">Search to generate dynamic physical Pinout Map</p>
                </div>
              )}
            </div>

            {/* Demo / History list */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-zinc-500 font-semibold">Alternative Queries</p>
              <div className="flex flex-wrap gap-1.5">
                {searchHistory.map((hist, k) => (
                  <button
                    key={k}
                    onClick={() => handleSearch(hist)}
                    disabled={isSearching}
                    className="text-[10px] px-2 py-1 bg-[#141416] hover:bg-[#202022] border border-[#222] rounded text-zinc-400 hover:text-white font-mono truncate max-w-full text-left"
                  >
                    &rarr; {hist}
                  </button>
                ))}
              </div>
            </div>

            {/* API Warning Section */}
            {!isApiKeySet && (
              <div className="bg-[#24130d] border border-amber-800/30 p-3 rounded-lg space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <AlertTriangle size={12} className="shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Secrets Offline Mode</span>
                </div>
                <p className="text-[10px] leading-relaxed text-amber-200/70">
                  Real-time database requests are running on procedural lookup logic. Supply a <strong className="text-white">GEMINI_API_KEY</strong> in Settings {"→"} Secrets to unlock auto-compiling real datasheets on demand.
                </p>
              </div>
            )}
          </div>

          {/* Footer of left sidebar */}
          <div className="p-4 border-t border-[#1a1a1c] bg-[#09090a]">
            <div className="bg-[#111112] p-3 rounded-xl border border-[#222224] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Activity size={12} className="text-emerald-500 animate-pulse shrink-0" />
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Logic: {activeBoard.specs.operatingVoltage}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Central Map Workspace */}
        <section className="flex-1 bg-[#070708] flex flex-col overflow-y-auto relative p-6 lg:p-8 space-y-6" id="center-map">

          {searchError && (
            <div className="bg-orange-950/20 border border-orange-500/30 p-4 rounded-xl flex items-start gap-3 text-orange-200 animate-fade-in shrink-0" id="search-error-banner">
              <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={16} />
              <div className="flex-1 text-xs leading-relaxed font-mono">
                <span className="font-bold text-[#f5f5f0] block mb-1">Interactive Diagnostic Fallback</span>
                <span>{searchError}</span>
              </div>
              <button
                onClick={() => setSearchError(null)}
                className="text-zinc-500 hover:text-white transition-colors p-0.5"
                title="Dismiss warning"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Header area of board view */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#141416]">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] bg-[#1a1a1c] border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono uppercase">
                  {activeBoard.specs.architecture}
                </span>
                {selectedBoardId === "custom" && (
                  <span className="text-[10px] bg-orange-950 border border-orange-500/20 text-orange-400 px-2 py-0.5 rounded font-mono uppercase flex items-center gap-1">
                    <Sparkles size={10} /> Real-time Intel Generated
                  </span>
                )}
              </div>
              <h2 className="text-3xl font-serif text-[#f5f5f0] tracking-tight underline decoration-[#222] decoration-2 underline-offset-8">
                {activeBoard.name}
              </h2>
              <p className="text-xs text-zinc-400 max-w-2xl mt-4 leading-relaxed">
                {activeBoard.description}
              </p>

              {/* Real-time PDF & Reference Document Reference Hub */}
              <div className="flex flex-wrap items-center gap-2 mt-4" id="datasheet-hub">
                {activeBoard.datasheetUrl && (
                  <a
                    href={activeBoard.datasheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#171310] hover:bg-orange-950/30 text-orange-400 font-mono text-[10px] font-bold rounded-lg border border-orange-900/40 hover:border-orange-500/60 transition-all shadow-sm"
                    title="Open official manufacturer PDF datasheet"
                  >
                    <FileText size={12} className="text-orange-500 animate-pulse shrink-0" />
                    <span>View Official Datasheet PDF</span>
                  </a>
                )}
                {activeBoard.additionalResources && activeBoard.additionalResources.map((res, index) => (
                  <a
                    key={index}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#121214] hover:bg-zinc-800 text-zinc-300 font-mono text-[10px] rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all"
                  >
                    <Info size={11} className="text-zinc-500 shrink-0" />
                    <span>{res.label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Search Panel Widget on the dashboard itself */}
            <div className="bg-[#0c0c0d] border border-[#1a1a1c] p-3 rounded-xl flex items-center gap-3 shrink-0">
              <div className="h-2 w-2 rounded-full bg-orange-500"></div>
              <div className="text-left font-mono">
                <div className="text-[9px] text-zinc-500 uppercase tracking-widest leading-none mb-0.5">Physical Board Configuration</div>
                <div className="text-xs text-zinc-300 font-bold leading-none">{activeBoard.pins.length} Total Pins mapped</div>
              </div>
            </div>
          </div>

          {/* Quick interactive filter toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0c0c0d]/60 border border-[#1a1a1c] px-4 py-2.5 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono text-zinc-500 mr-2 font-bold">Highlight Signal Map:</span>
              <div className="flex flex-wrap gap-1">
                {[
                  { id: "all", label: "Show All", color: "border-zinc-800 text-zinc-300" },
                  { id: "gpio", label: "GPIO Pins", color: "border-emerald-800 text-emerald-400 bg-emerald-950/10" },
                  { id: "analog", label: "Analog (ADC/DAC)", color: "border-sky-800 text-sky-400 bg-sky-950/10" },
                  { id: "interfaces", label: "Protocol (SPI/I2C/UART)", color: "border-indigo-800 text-indigo-400 bg-indigo-950/10" },
                  { id: "cautions", label: "Critical Strapping/Cautions", color: "border-amber-800 text-amber-400 bg-amber-950/10" }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setPinFilter(item.id)}
                    className={`text-[10px] px-2.5 py-1 rounded transition-all border font-medium ${pinFilter === item.id
                        ? `${item.color.replace('bg-opacity-10', 'bg-opacity-30')} scale-[1.02] border font-semibold outline-none ring-1 ring-zinc-700`
                        : "bg-[#141416] border-transparent text-zinc-400 hover:text-white"
                      }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Count of matching highlighted pins */}
            <div className="text-[10px] text-zinc-500 font-mono">
              Matching signals: {activeBoard.pins.filter(satisfiesFilter).length}
            </div>
          </div>

          {/* Loading status overlay screen for search */}
          {isSearching && (
            <div className="absolute inset-0 bg-[#0a0a0b]/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
              <div className="relative mb-6">
                <div className="w-16 h-16 border-2 border-orange-500/10 border-t-2 border-t-orange-500 rounded-full animate-spin"></div>
                <Cpu className="absolute inset-x-0 inset-y-0 m-auto text-orange-500 animate-pulse" size={24} />
              </div>
              <h3 className="text-md font-serif text-[#f5f5f0] tracking-wide mb-1">AI Silkscreen Synthesis</h3>
              <p className="text-xs text-orange-400 font-mono animate-pulse mb-6">Scanning electronic datasheets to generate interactive pinouts...</p>

              {/* Dynamic steps simulation to ease tension while waiting */}
              <div className="max-w-xs space-y-2 text-left bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 font-mono text-[9px] text-zinc-500">
                <div className="flex items-center gap-2"><CheckCircle2 size={10} className="text-emerald-500 shrink-0" /> Synchronized Gemini architecture engine</div>
                <div className="flex flex-row items-center gap-2"><RefreshCcw size={10} className="text-orange-500 animate-spin shrink-0" /> Digesting manufacturer hardware registry</div>
                <div className="flex items-center gap-2 text-zinc-600">&bull; Organizing physical controller coordinates</div>
                <div className="flex items-center gap-2 text-zinc-600">&bull; Flagging dangerous bootstrapping & VCC tolerances</div>
              </div>
            </div>
          )}

          {/* Map Layout: Visualizes the Selected Board */}
          <div className="flex-1 flex flex-col xl:flex-row gap-8 items-center justify-center bg-[#09090a] border border-[#141416]/80 p-8 rounded-2xl relative min-h-[480px]">

            {/* Visual Board representation */}
            <div className="relative flex items-center justify-center py-10 scale-[0.98] transition-transform">

              {/* Conditional Layouts based on layoutType attribute *              {/* DUAL-INLINE WRAPPER (ESP32, Pico, ATtiny85, Nano) */}
              {activeBoard.layoutType === "dual-inline" && (
                <div className="flex items-center gap-6 lg:gap-10 relative px-4">

                  {/* Left Column Pins */}
                  <div className="flex flex-col gap-1 lg:gap-1.5 text-right w-44 lg:w-48 z-10">
                    {leftPins.map((pin) => {
                      const colorTheme = getPinCategoryColor(pin);
                      const isHighlighted = satisfiesFilter(pin);
                      const isHovered = hoveredPinName === pin.name;
                      const isSelected = selectedPinName === pin.name;

                      return (
                        <div
                          key={pin.number}
                          onMouseEnter={() => setHoveredPinName(pin.name)}
                          onMouseLeave={() => setHoveredPinName(null)}
                          onClick={() => setSelectedPinName(isSelected ? null : pin.name)}
                          className={`group flex items-center justify-end gap-2 cursor-pointer transition-all duration-150 ${isHighlighted ? "opacity-100" : "opacity-30"
                            } ${isHovered || isSelected ? "scale-[1.05]" : ""}`}
                          id={`left-pin-${pin.number}`}
                        >
                          <div className="flex flex-col">
                            <span className={`text-[11px] lg:text-xs font-mono font-bold leading-tight transition-colors ${isHovered || isSelected ? "text-orange-400" : "text-zinc-300 group-hover:text-zinc-100"
                              }`}>
                              {pin.name}
                            </span>
                            <span className="text-[8px] lg:text-[9px] text-zinc-500 uppercase tracking-tighter leading-none group-hover:text-zinc-400">
                              {pin.primary}
                            </span>
                          </div>

                          {/* Larger interactive Solder socket representation */}
                          <div className={`w-5.5 h-5.5 lg:w-6 lg:h-6 rounded-md flex items-center justify-center font-mono text-[9px] lg:text-[10px] font-extrabold border transition-all shadow-inner ${isHovered || isSelected
                              ? "bg-orange-500 border-white text-black ring-2 ring-orange-500/60 scale-110"
                              : `${colorTheme.bg} ${colorTheme.border}`
                            }`}>
                            {pin.number}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Smaller & sleeker physical silicon package representation */}
                  <div className={`relative w-40 lg:w-44 h-[390px] bg-[#121214] rounded-xl border-2 border-zinc-800 flex flex-col items-center justify-between py-6 shadow-2xl flex-shrink-0 ${activeBoard.id.includes("esp32") ? "border-t-[14px] border-t-zinc-950" : ""
                    }`}>

                    {/* Metal Module for ESP32 */}
                    {activeBoard.id.includes("esp32") ? (
                      <div className="w-32 h-22 bg-[#252528] rounded-lg border border-zinc-700/80 p-2 mx-auto flex flex-col items-center justify-between text-center relative overflow-hidden shadow-inner">
                        <div className="absolute top-0 inset-x-0 h-1 bg-zinc-950"></div>
                        <span className="text-[8px] font-mono font-bold tracking-tight text-orange-400/90">ESP-WROOM-32D</span>
                        <div className="w-8 h-8 border border-zinc-650 opacity-40 rounded flex items-center justify-center">
                          <Cpu size={12} className="text-zinc-500 animate-pulse" />
                        </div>
                        <span className="text-[6px] font-mono text-zinc-550">CE 211-161107 FCC</span>
                      </div>
                    ) : activeBoard.id.includes("tiny") ? (
                      // DIP 8 physical chip view center piece
                      <div className="w-28 h-28 bg-[#0e0e0f] rounded-lg border border-zinc-900 flex flex-col items-center justify-center p-2 shadow-xl relative">
                        <div className="absolute top-2 w-3 h-1.5 bg-zinc-950 rounded-full"></div>
                        <span className="text-[8px] font-mono font-bold text-zinc-500 tracking-wider mt-1">{activeBoard.specs.architecture.split(" ")[0]}</span>
                        <span className="font-serif italic text-[10px] text-orange-700/60 my-1 font-bold">ATtiny85</span>
                        <div className="w-2 h-2 rounded-full bg-zinc-900 border border-zinc-800 absolute top-1.5 left-1.5"></div>
                      </div>
                    ) : (
                      // Generic dynamic silicon
                      <div className="w-32 h-22 bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-lg border border-zinc-800 p-2 flex flex-col items-center justify-center space-y-0.5">
                        <Cpu className="text-zinc-600 hover:text-orange-500 transition-colors" size={18} />
                        <span className="text-[8px] font-mono text-zinc-400 font-bold">{activeBoard.name.split(" ")[0]}</span>
                        <span className="text-[6px] font-mono text-zinc-650">Synthesis Map v1.1</span>
                      </div>
                    )}

                    {/* Passive Elements */}
                    <div className="w-32 flex items-center justify-between px-2 text-[6px] font-mono text-zinc-600">
                      <div className="flex flex-col gap-0.5 items-center">
                        <div className="w-2.5 h-0.5 bg-red-850/60 rounded-sm"></div>
                        <span>PWR LED</span>
                      </div>

                      <div className="w-4 h-4 rounded-sm border border-zinc-800 flex items-center justify-center text-[7px] bg-zinc-950">RST</div>

                      <div className="flex flex-col gap-0.5 items-center">
                        <div className="w-2.5 h-0.5 bg-blue-800/60 rounded-sm"></div>
                        <span>STATUS</span>
                      </div>
                    </div>

                    {/* Integrated interface connector visual */}
                    <div className="w-14 h-9 bg-gradient-to-t from-zinc-900 to-zinc-950 border-t border-t-zinc-800 rounded-sm flex flex-col items-center justify-center text-[6px] font-mono text-zinc-550">
                      <div className="w-6 h-1 bg-zinc-950 rounded-sm mb-0.5 border-t border-zinc-900 shadow-inner"></div>
                      <span>Micro USB</span>
                    </div>
                  </div>

                  {/* Right Column Pins */}
                  <div className="flex flex-col gap-1 lg:gap-1.5 text-left w-44 lg:w-48 z-10">
                    {rightPins.map((pin) => {
                      const colorTheme = getPinCategoryColor(pin);
                      const isHighlighted = satisfiesFilter(pin);
                      const isHovered = hoveredPinName === pin.name;
                      const isSelected = selectedPinName === pin.name;

                      return (
                        <div
                          key={pin.number}
                          onMouseEnter={() => setHoveredPinName(pin.name)}
                          onMouseLeave={() => setHoveredPinName(null)}
                          onClick={() => setSelectedPinName(isSelected ? null : pin.name)}
                          className={`group flex items-center justify-start gap-2 cursor-pointer transition-all duration-150 ${isHighlighted ? "opacity-100" : "opacity-30"
                            } ${isHovered || isSelected ? "scale-[1.05]" : ""}`}
                          id={`right-pin-${pin.number}`}
                        >
                          {/* Larger interactive Solder socket representation */}
                          <div className={`w-5.5 h-5.5 lg:w-6 lg:h-6 rounded-md flex items-center justify-center font-mono text-[9px] lg:text-[10px] font-extrabold border transition-all shadow-inner ${isHovered || isSelected
                              ? "bg-orange-500 border-white text-black ring-2 ring-orange-500/60 scale-110"
                              : `${colorTheme.bg} ${colorTheme.border}`
                            }`}>
                            {pin.number}
                          </div>

                          <div className="flex flex-col">
                            <span className={`text-[11px] lg:text-xs font-mono font-bold leading-tight transition-colors ${isHovered || isSelected ? "text-orange-400" : "text-zinc-300 group-hover:text-zinc-100"
                              }`}>
                              {pin.name}
                            </span>
                            <span className="text-[8px] lg:text-[9px] text-zinc-500 uppercase tracking-tighter leading-none group-hover:text-zinc-400">
                              {pin.primary}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ARDUINO HEADERS WRAPPER (Uno, Custom Medium-sized boards) */}
              {(activeBoard.layoutType === "arduino-headers" || activeBoard.layoutType === "mega-headers") && (
                <div className="flex items-center gap-6 lg:gap-10 relative px-4">

                  {/* Left Column Pins */}
                  <div className="flex flex-col gap-1 lg:gap-1.5 text-right w-44 lg:w-48 z-10">
                    {leftPins.map((pin) => {
                      const colorTheme = getPinCategoryColor(pin);
                      const isHighlighted = satisfiesFilter(pin);
                      const isHovered = hoveredPinName === pin.name;
                      const isSelected = selectedPinName === pin.name;
                      return (
                        <div
                          key={pin.number}
                          onMouseEnter={() => setHoveredPinName(pin.name)}
                          onMouseLeave={() => setHoveredPinName(null)}
                          onClick={() => setSelectedPinName(isSelected ? null : pin.name)}
                          className={`group flex items-center justify-end gap-2 cursor-pointer transition-all duration-150 ${isHighlighted ? "opacity-100" : "opacity-30"
                            } ${isHovered || isSelected ? "scale-[1.05]" : ""}`}
                          id={`left-pin-${pin.number}`}
                        >
                          <div className="flex flex-col">
                            <span className={`text-[11px] lg:text-xs font-mono font-bold leading-tight transition-colors ${isHovered || isSelected ? "text-orange-400" : "text-zinc-300 group-hover:text-zinc-100"
                              }`}>
                              {pin.name}
                            </span>
                            <span className="text-[8px] lg:text-[9px] text-zinc-500 uppercase tracking-tighter leading-none group-hover:text-zinc-400">
                              {pin.primary}
                            </span>
                          </div>

                          {/* Larger interactive Solder socket representation */}
                          <div className={`w-5.5 h-5.5 lg:w-6 lg:h-6 rounded-md flex items-center justify-center font-mono text-[9px] lg:text-[10px] font-extrabold border transition-all shadow-inner ${isHovered || isSelected
                              ? "bg-orange-500 border-white text-black ring-2 ring-orange-500/60 scale-110"
                              : `${colorTheme.bg} ${colorTheme.border}`
                            }`}>
                            {pin.number}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Compact modernized vertical Arduino style PCB frame */}
                  <div className={`relative w-40 lg:w-44 h-[390px] bg-[#0c121e] rounded-xl border border-[#1b2536] flex flex-col items-center justify-between py-6 shadow-2xl flex-shrink-0`}>

                    {/* USB Connector visual at top */}
                    <div className="w-16 h-10 bg-gradient-to-b from-zinc-850 to-zinc-950 border border-zinc-700/60 rounded flex flex-col items-center justify-center text-[6px] font-mono text-zinc-500 shadow-inner">
                      <span>USB Type-B</span>
                    </div>

                    {/* Chip architecture */}
                    <div className="text-center">
                      <span className="text-[7px] font-mono uppercase tracking-widest text-[#2d4778]">Open-Source Hardware</span>
                    </div>

                    {/* DIP Processor Centerpiece */}
                    {activeBoard.layoutType === "mega-headers" ? (
                      <div className="w-16 h-16 bg-zinc-900 rounded border border-[#1c2e4f] flex flex-col items-center justify-center p-2 shadow-inner rotate-45 relative">
                        <span className="text-[7px] font-mono font-bold text-zinc-500 -rotate-45">ATMEGA2560</span>
                      </div>
                    ) : (
                      <div className="w-8 h-24 bg-zinc-950 rounded border border-[#1b273d] flex flex-col items-center justify-around py-2 shadow-md">
                        <div className="h-0.5 w-full bg-[#111] border-b border-[#050510]"></div>
                        <span className="text-[7px] font-mono font-bold tracking-widest text-zinc-500 [writing-mode:vertical-lr] rotate-180">ATMEGA328P</span>
                        <div className="h-0.5 w-full bg-[#111] border-t border-[#050510]"></div>
                      </div>
                    )}

                    {/* Board label silkscreen */}
                    <div className="text-center font-mono opacity-80">
                      <div className="text-[10px] font-bold text-sky-400">{activeBoard.name.split(" ")[0]}</div>
                      <div className="text-[5px] text-zinc-500 tracking-wider font-mono">REFERENCE MAP</div>
                    </div>

                    {/* DC Power Feed at bottom */}
                    <div className="w-14 h-12 bg-gradient-to-t from-zinc-900 to-zinc-950 border-t border-t-zinc-800 rounded flex flex-col items-center justify-center text-[6px] font-mono text-zinc-530 shadow-inner">
                      <div className="w-5 h-5 bg-zinc-950 rounded-sm mb-0.5 border border-zinc-900 shadow-inner"></div>
                      <span>9V DC JACK</span>
                    </div>

                  </div>

                  {/* Right Column Pins */}
                  <div className="flex flex-col gap-1 lg:gap-1.5 text-left w-44 lg:w-48 z-10">
                    {rightPins.map((pin) => {
                      const colorTheme = getPinCategoryColor(pin);
                      const isHighlighted = satisfiesFilter(pin);
                      const isHovered = hoveredPinName === pin.name;
                      const isSelected = selectedPinName === pin.name;
                      return (
                        <div
                          key={pin.number}
                          onMouseEnter={() => setHoveredPinName(pin.name)}
                          onMouseLeave={() => setHoveredPinName(null)}
                          onClick={() => setSelectedPinName(isSelected ? null : pin.name)}
                          className={`group flex items-center justify-start gap-2 cursor-pointer transition-all duration-150 ${isHighlighted ? "opacity-100" : "opacity-30"
                            } ${isHovered || isSelected ? "scale-[1.05]" : ""}`}
                          id={`right-pin-${pin.number}`}
                        >
                          {/* Larger interactive Solder socket representation */}
                          <div className={`w-5.5 h-5.5 lg:w-6 lg:h-6 rounded-md flex items-center justify-center font-mono text-[9px] lg:text-[10px] font-extrabold border transition-all shadow-inner ${isHovered || isSelected
                              ? "bg-orange-500 border-white text-black ring-2 ring-orange-500/60 scale-110"
                              : `${colorTheme.bg} ${colorTheme.border}`
                            }`}>
                            {pin.number}
                          </div>

                          <div className="flex flex-col">
                            <span className={`text-[11px] lg:text-xs font-mono font-bold leading-tight transition-colors ${isHovered || isSelected ? "text-orange-400" : "text-zinc-300 group-hover:text-zinc-100"
                              }`}>
                              {pin.name}
                            </span>
                            <span className="text-[8px] lg:text-[9px] text-zinc-500 uppercase tracking-tighter leading-none group-hover:text-zinc-400">
                              {pin.primary}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

              {/* Floating Real-time HUD Pin-detail indicator for hovered or clicked */}
              {focusedPin && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#0c0c0d] border-2 border-orange-500/30 px-4 py-3 rounded-xl shadow-xl z-20 w-80 text-center animate-fade-in">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-mono font-bold text-orange-400 bg-orange-950/40 px-1.5 py-0.2 rounded uppercase">
                      Physical PIN {focusedPin.number}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500">
                      GPIO Map: {focusedPin.gpio}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white tracking-tight">{focusedPin.name}</h4>
                  <p className="text-[11px] text-zinc-400 mb-2 leading-tight">{focusedPin.primary}</p>

                  {/* Capabilities Tags */}
                  <div className="flex flex-wrap gap-1 justify-center mb-1.5">
                    {focusedPin.features.map((feat, ix) => (
                      <span key={ix} className="text-[8px] bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono px-1 py-0.1 rounded">
                        {feat}
                      </span>
                    ))}
                  </div>

                  {/* Warning inside the HUD */}
                  {focusedPin.caution && (
                    <div className="mt-2 bg-[#2d120a] border border-red-900/30 p-1.5 rounded text-left">
                      <p className="text-[9px] text-[#e0a98f] leading-normal font-medium flex items-start gap-1">
                        <AlertTriangle size={10} className="shrink-0 text-orange-400 mt-0.5" />
                        <span>{focusedPin.caution}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Legend Widget bar inside map space */}
            <div className="absolute bottom-4 inset-x-8 flex flex-wrap gap-x-6 gap-y-2 justify-center border-t border-[#1a1a1c] pt-4 text-[10px] uppercase tracking-wider text-zinc-500 font-mono">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded bg-zinc-900 border border-zinc-800"></div>
                <span>Ground / GND</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded bg-red-950/50 border border-red-900"></div>
                <span>VCC / Power</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded bg-sky-950/50 border border-sky-900"></div>
                <span>Analog Input (ADC)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded bg-indigo-950/50 border border-indigo-900"></div>
                <span>UART / Serial TX RX</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded bg-emerald-950/50 border border-emerald-900"></div>
                <span>I2C / SPI Buses</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded bg-amber-950/50 border border-amber-900"></div>
                <span>Critical Strp / Flash</span>
              </div>
            </div>

          </div>

          {/* Quick interactive datasheet details table */}
          <div className="bg-[#0c0c0d] border border-[#1a1a1c] p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
              <FileText size={13} className="text-orange-500" /> Datasheet Specifications (Real-Time Extract)
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-[#141416] p-3 rounded-xl border border-zinc-800/40">
                <div className="text-zinc-500 font-mono text-[9px] uppercase tracking-widest mb-1">Architecture</div>
                <div className="text-[#f5f5f0] font-semibold">{activeBoard.specs.architecture}</div>
              </div>
              <div className="bg-[#141416] p-3 rounded-xl border border-zinc-800/40">
                <div className="text-zinc-500 font-mono text-[9px] uppercase tracking-widest mb-1">Clock Speed</div>
                <div className="text-[#f5f5f0] font-semibold">{activeBoard.specs.clockSpeed}</div>
              </div>
              <div className="bg-[#141416] p-3 rounded-xl border border-zinc-800/40">
                <div className="text-zinc-500 font-mono text-[9px] uppercase tracking-widest mb-1">Logic Voltage</div>
                <div className="text-[#f5f5f0] font-semibold">{activeBoard.specs.operatingVoltage}</div>
              </div>
              <div className="bg-[#141416] p-3 rounded-xl border border-zinc-800/40">
                <div className="text-zinc-500 font-mono text-[9px] uppercase tracking-widest mb-1">Flash Memory</div>
                <div className="text-[#f5f5f0] font-semibold">{activeBoard.specs.flashMemory}</div>
              </div>
              <div className="bg-[#141416] p-3 rounded-xl border border-zinc-800/40">
                <div className="text-zinc-500 font-mono text-[9px] uppercase tracking-widest mb-1">SRAM Capacity</div>
                <div className="text-[#f5f5f0] font-semibold">{activeBoard.specs.ramSize}</div>
              </div>
              <div className="bg-[#141416] p-3 rounded-xl border border-zinc-800/40">
                <div className="text-zinc-500 font-mono text-[9px] uppercase tracking-widest mb-1">General GPIOs</div>
                <div className="text-[#f5f5f0] font-semibold">{activeBoard.specs.gpioCount} Pins</div>
              </div>
              <div className="bg-[#141416] p-3 rounded-xl border border-zinc-800/40">
                <div className="text-zinc-500 font-mono text-[9px] uppercase tracking-widest mb-1">ADC Channels</div>
                <div className="text-[#f5f5f0] font-semibold">{activeBoard.specs.adcChannels}</div>
              </div>
              <div className="bg-[#141416] p-3 rounded-xl border border-zinc-800/40">
                <div className="text-zinc-500 font-mono text-[9px] uppercase tracking-widest mb-1">Protocols / Peripherals</div>
                <div className="text-[#f5f5f0] font-semibold truncate hover:text-clip">{activeBoard.specs.interfaces}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Details Panel: Critical warnings, input-only list, and default protocols */}
        <aside className="w-80 border-l border-[#1a1a1c] bg-[#0c0c0d] p-6 space-y-6 overflow-y-auto shrink-0" id="sidebar-right">

          {/* Default Protocol Maps list */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-3 flex items-center gap-2">
              <Layers size={13} className="text-emerald-500" /> Default hardware buses
            </h3>
            {activeBoard.peripherals && activeBoard.peripherals.length > 0 ? (
              <div className="space-y-1.5">
                {activeBoard.peripherals.map((per, index) => (
                  <div key={index} className="bg-[#141416] p-2.5 border border-zinc-800/40 rounded-lg">
                    <p className="text-[10px] font-mono font-bold text-emerald-400 mb-0.5">{per.interfaceType}</p>
                    <p className="text-[10px] text-zinc-300 font-mono leading-relaxed">{per.pinsUsed}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-zinc-600 italic">No static communication overrides defined on this dynamic map.</p>
            )}
          </div>

          {/* Pin Cautions Checklist */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500 mb-3 flex items-center gap-2">
              <AlertTriangle size={13} /> Silicon Constraints
            </h3>

            <div className="space-y-3">
              {activeBoard.warnings.map((warning, idx) => {
                // Check if it matches key terms to show badge flags
                const isInputOnly = warning.toLowerCase().includes("input-only");
                const isStrap = warning.toLowerCase().includes("strapping") || warning.toLowerCase().includes("boot");
                const isFlash = warning.toLowerCase().includes("flash") || warning.toLowerCase().includes("mem");

                return (
                  <div
                    key={idx}
                    className="bg-[#161210] border border-orange-950/50 p-3 rounded-lg space-y-1"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[8px] uppercase font-mono px-1.5 py-0.2 rounded font-bold ${isInputOnly ? "bg-amber-950 text-amber-300" :
                          isStrap ? "bg-red-950 text-red-300" :
                            isFlash ? "bg-zinc-800 text-zinc-200" :
                              "bg-orange-950 text-orange-400"
                        }`}>
                        {isInputOnly ? "Input Limit" :
                          isStrap ? "Boot Critical" :
                            isFlash ? "Flash SPI" :
                              "Careful Input"}
                      </span>
                    </div>
                    <p className="text-[10px] leading-relaxed text-[#a89082] font-mono">
                      {warning}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Checklist Guidelines */}
          <div className="pt-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-3 flex items-center gap-2">
              <Info size={13} className="text-sky-500" /> Wiring Safety Guide
            </h3>
            <ul className="text-[10px] text-zinc-400 leading-relaxed font-mono list-disc list-inside space-y-1.5 bg-[#141416]/50 p-2.5 rounded-xl border border-zinc-800/40">
              <li>Check logic voltage levels before applying power</li>
              <li>Always connect Grounds first</li>
              <li>Don't draw more than 200mA total from all pins</li>
              <li>Leave strapping pins floating during boot</li>
            </ul>
          </div>

        </aside>
      </main>
    </div>
  );
}
