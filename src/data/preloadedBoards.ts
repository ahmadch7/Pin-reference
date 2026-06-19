import { MicrocontrollerBoard } from '../types';

export const preloadedBoards: MicrocontrollerBoard[] = [
  {
    id: "esp32-30pin",
    name: "ESP32 DevKit V1 (30-Pin)",
    description: "Extremely popular dual-core development board featuring Wi-Fi, Bluetooth, and highly flexible pin multiplexing. Operating logic is strictly 3.3V.",
    layoutType: "dual-inline",
    datasheetUrl: "https://documentation.espressif.com/esp32-wroom-32_datasheet_en.pdf",
    additionalResources: [
      { label: "ESP32 Technical Reference", url: "https://www.espressif.com/sites/default/files/documentation/esp32_technical_reference_manual_en.pdf" },
      { label: "Espressif Documentation Support", url: "https://espressif.com/en/support/documents/technical-documents" }
    ],
    specs: {
      architecture: "Xtensa Dual-Core 32-bit LX6",
      clockSpeed: "240 MHz",
      operatingVoltage: "3.3V Logic (5V VIN Input)",
      flashMemory: "4 MB (SPI Flash)",
      ramSize: "520 KB SRAM",
      gpioCount: 25,
      adcChannels: "15 Channels (12-bit ADC1/ADC2)",
      dacChannels: "2 Channels (8-bit DAC1/DAC2)",
      interfaces: "3x UART, 3x SPI, 2x I2C, 2x I2S, CAN bus, PWM"
    },
    warnings: [
      "Logic Level is 3.3V: Connecting 5V directly to target GPIO pins can permanently destroy the ESP32 chip.",
      "Input-Only Pins: GPIO 34, 35, 36 (VP), and 39 (VN) do not have internal pull-up/pull-down resistors and cannot be used as outputs.",
      "Internal Flash Clash: Do NOT use GPIO 6, 7, 8, 9, 10, or 11. They are wired directly to the internal SPI flash memory of the module. High usage causes instant crash.",
      "Strapping Pins (Boot Critical): GPIO 0, 2, 5, 12, and 15 affect the chip booting sequence. Ensure no pull-up or pull-down connections lock the state during startup.",
      "ADC2 Limitation: While Wi-Fi is active, ADC2 channels (GPIOs 0, 2, 4, 12, 13, 14, 15, 25, 26, 27) cannot be used for analog reads."
    ],
    peripherals: [
      { interfaceType: "I2C (Default)", pinsUsed: "SDA: GPIO21, SCL: GPIO22" },
      { interfaceType: "SPI (VSPI - Recommended)", pinsUsed: "MOSI: GPIO23, MISO: GPIO19, SCK: GPIO18, CS: GPIO5" },
      { interfaceType: "SPI (HSPI)", pinsUsed: "MOSI: GPIO13, MISO: GPIO12, SCK: GPIO14, CS: GPIO15" },
      { interfaceType: "UART0 (Debug/USB)", pinsUsed: "TX: GPIO1, RX: GPIO3" },
      { interfaceType: "UART2", pinsUsed: "TX: GPIO17, RX: GPIO16" }
    ],
    pins: [
      // Left Side (pins 1 to 15)
      { number: "1", name: "EN", gpio: "N/A", features: ["Power", "CHIP_PU", "Reset"], primary: "Chip Enable / Reset", caution: "Pull-up onboard. Tie to GND to reset.", isCaution: false },
      { number: "2", name: "VP (G36)", gpio: "36", features: ["ADC1_CH0", "RTC_GPIO0", "SENSOR_VP"], primary: "Analog Input Only", caution: "Input Only. No internal pull-ups or output capabilities.", isCaution: true },
      { number: "3", name: "VN (G39)", gpio: "39", features: ["ADC1_CH3", "RTC_GPIO3", "SENSOR_VN"], primary: "Analog Input Only", caution: "Input Only. No internal pull-ups or output capabilities.", isCaution: true },
      { number: "4", name: "G34", gpio: "34", features: ["ADC1_CH6", "RTC_GPIO4"], primary: "Analog Input Only", caution: "Input Only. No internal pull-ups or output capabilities.", isCaution: true },
      { number: "5", name: "G35", gpio: "35", features: ["ADC1_CH7", "RTC_GPIO5"], primary: "Analog Input Only", caution: "Input Only. No internal pull-ups or output capabilities.", isCaution: true },
      { number: "6", name: "G32", gpio: "32", features: ["GPIO", "ADC1_CH4", "TOUCH9", "RTC_GPIO9"], primary: "Digital I/O / ADC", caution: "Safe Touch/Analog pin.", isCaution: false },
      { number: "7", name: "G33", gpio: "33", features: ["GPIO", "ADC1_CH5", "TOUCH8", "RTC_GPIO8"], primary: "Digital I/O / ADC", caution: "Safe Touch/Analog pin.", isCaution: false },
      { number: "8", name: "G25", gpio: "25", features: ["GPIO", "DAC1", "ADC2_CH8", "RTC_GPIO6"], primary: "True Analog Out (DAC)", caution: "DAC1 output. High precision 8-bit analog stream.", isCaution: false },
      { number: "9", name: "G26", gpio: "26", features: ["GPIO", "DAC2", "ADC2_CH9", "RTC_GPIO7"], primary: "True Analog Out (DAC)", caution: "DAC2 output. High precision 8-bit analog stream.", isCaution: false },
      { number: "10", name: "G27", gpio: "27", features: ["GPIO", "ADC2_CH7", "TOUCH7", "RTC_GPIO17"], primary: "Digital I/O / Touch", caution: "Touch channel.", isCaution: false },
      { number: "11", name: "G14", gpio: "14", features: ["GPIO", "ADC2_CH6", "TOUCH6", "HSPI_CLK", "RTC_GPIO16"], primary: "Digital I/O / SPI CLK", caution: "Strapping pin. Emits PWM debug signal on boot.", isCaution: true },
      { number: "12", name: "G12", gpio: "12", features: ["GPIO", "ADC2_CH5", "TOUCH5", "HSPI_MISO", "RTC_GPIO15"], primary: "Digital I/O / HSPI MISO", caution: "Strapping pin (MTDI). Boot fails if pulled high - sets flash voltage to 1.8V instead of 3.3V.", isCaution: true },
      { number: "13", name: "G13", gpio: "13", features: ["GPIO", "ADC2_CH4", "TOUCH4", "HSPI_MOSI", "RTC_GPIO14"], primary: "Digital I/O / HSPI MOSI", caution: "Safe general logic.", isCaution: false },
      { number: "14", name: "GND", gpio: "N/A", features: ["Ground"], primary: "System Ground", caution: "Connect to circuit reference ground.", isCaution: false },
      { number: "15", name: "VIN", gpio: "N/A", features: ["Power Input"], primary: "5V Power Input", caution: "Varying 5V source connects here. Powers internal 3.3V regulator.", isCaution: false },

      // Right Side (pins 16 to 30)
      { number: "16", name: "G23", gpio: "23", features: ["GPIO", "VSPI_MOSI"], primary: "Digital I/O / VSPI MOSI", caution: "Main default MOSI pin.", isCaution: false },
      { number: "17", name: "G22", gpio: "22", features: ["GPIO", "I2C_SCL"], primary: "I2C SCL", caution: "Default SCL. Pull-up resistor required.", isCaution: false },
      { number: "18", name: "G1", gpio: "1", features: ["UART0_TXD", "GPIO"], primary: "Serial Hardware TX (Debug)", caution: "Do not pull low on boot. Connected to onboard CP2102 chip.", isCaution: true },
      { number: "19", name: "G3", gpio: "3", features: ["UART0_RXD", "GPIO"], primary: "Serial Hardware RX (Debug)", caution: "Do not pull high on boot. Connected to onboard CP2102 chip.", isCaution: true },
      { number: "20", name: "G21", gpio: "21", features: ["GPIO", "I2C_SDA"], primary: "I2C SDA", caution: "Default SDA. Pull-up resistor required.", isCaution: false },
      { number: "21", name: "G19", gpio: "19", features: ["GPIO", "VSPI_MISO"], primary: "Digital I/O / VSPI MISO", caution: "Main default MISO pin.", isCaution: false },
      { number: "22", name: "G18", gpio: "18", features: ["GPIO", "VSPI_SCK"], primary: "Digital I/O / VSPI SCK", caution: "Main default SCK pin.", isCaution: false },
      { number: "23", name: "G5", gpio: "5", features: ["GPIO", "VSPI_CS", "RTC_GPIO14"], primary: "Digital I/O / VSPI CS", caution: "Strapping pin. Forces PWM out at boot. Ensure float or pulled high on start.", isCaution: true },
      { number: "24", name: "G17", gpio: "17", features: ["GPIO", "UART2_TXD"], primary: "UART2 TX", caution: "Tied to PSRAM on ESP32-WROVER. Safe on standard WROOM.", isCaution: false },
      { number: "25", name: "G16", gpio: "16", features: ["GPIO", "UART2_RXD"], primary: "UART2 RX", caution: "Tied to PSRAM on ESP32-WROVER. Safe on standard WROOM.", isCaution: false },
      { number: "26", name: "G4", gpio: "4", features: ["GPIO", "ADC2_CH0", "TOUCH0", "HSPI_WP"], primary: "Digital I/O / ADC", caution: "Capable capacitance touch channel.", isCaution: false },
      { number: "27", name: "G2", gpio: "2", features: ["GPIO", "ADC2_CH2", "TOUCH2", "Built-In LED"], primary: "Digital I/O / Built-in LED", caution: "Strapping Pin. Must float or be LOW to enter upload/flashing mode.", isCaution: true },
      { number: "28", name: "G15", gpio: "15", features: ["GPIO", "ADC2_CH3", "TOUCH3", "HSPI_CS", "RTC_GPIO13"], primary: "Digital I/O / HSPI CS", caution: "Strapping Pin. Sends debug log to quiet UART on boot if HIGH.", isCaution: true },
      { number: "29", name: "GND", gpio: "N/A", features: ["Ground"], primary: "System Ground", caution: "Connect to circuit reference ground.", isCaution: false },
      { number: "30", name: "3V3", gpio: "N/A", features: ["3.3V Output"], primary: "Regulated 3.3V Out", caution: "Outputs clean regulated 3.3V. Limit draw to < 250mA.", isCaution: false }
    ]
  },
  {
    id: "arduino-uno",
    name: "Arduino Uno R3",
    description: "The gold standard of microcontroller boards. Highly rugged, operates on standard 5V logic with an Atmega328P processor.",
    layoutType: "arduino-headers",
    datasheetUrl: "https://docs.arduino.cc/resources/datasheets/A000066-datasheet.pdf",
    additionalResources: [
      { label: "Official Arduino Uno Page", url: "https://docs.arduino.cc/hardware/uno-rev3/" },
      { label: "ATmega328P Chip Datasheet", url: "https://ww1.microchip.com/downloads/en/DeviceDoc/Atmel-7810-Automotive-Microcontrollers-ATmega328P_Datasheet.pdf" }
    ],
    specs: {
      architecture: "AVR RISC 8-bit ATmega328P",
      clockSpeed: "16 MHz",
      operatingVoltage: "5V Logic (7-12V Input)",
      flashMemory: "32 KB (0.5 KB used by bootloader)",
      ramSize: "2 KB SRAM + 1 KB EEPROM",
      gpioCount: 14,
      adcChannels: "6 Channels (10-bit)",
      dacChannels: "None (Software PWM only)",
      interfaces: "1x UART, 1x SPI, 1x I2C, 6x Hardware PWM"
    },
    warnings: [
      "Logic level is 5V. Inputs are highly tolerant, but do not supply higher than 5.5V to any GPIO pin.",
      "The 3.3V output rail has a maximum current limit of 150mA, driven by the onboard USB-to-Serial converter.",
      "Total current output of all GPIO pins combined must not exceed 200mA. Limit individual pins to max 20mA.",
      "Digital Pins 0 (RX) and 1 (TX) are directly tied to the USB serial adapter. Avoid connecting buttons or low-impedance circuits to them while uploading code."
    ],
    peripherals: [
      { interfaceType: "I2C", pinsUsed: "SDA: Analog Pin 4, SCL: Analog Pin 5 (Also broken out near AREF)" },
      { interfaceType: "SPI", pinsUsed: "MOSI: Pin 11, MISO: Pin 12, SCK: Pin 13, SS: Pin 10 (Also available on ICSP)" },
      { interfaceType: "UART", pinsUsed: "TXD: Pin 1, RXD: Pin 0" },
      { interfaceType: "PWM (Analog Out)", pinsUsed: "Pins 3, 5, 6, 9, 10, 11" }
    ],
    pins: [
      // Digital Header pins
      { number: "D0", name: "D0 / RX", gpio: "0", features: ["Digital I/O", "UART_RX"], primary: "Serial RX / Upload Interface", caution: "Tied to USB. Can stall uploads if wired to external circuitry during chip flashing.", isCaution: true },
      { number: "D1", name: "D1 / TX", gpio: "1", features: ["Digital I/O", "UART_TX"], primary: "Serial TX", caution: "Tied to USB. Flickers during code run/debug.", isCaution: false },
      { number: "D2", name: "D2", gpio: "2", features: ["Digital I/O", "External Interrupt 0"], primary: "Digital I/O / Interrupt Input", caution: "", isCaution: false },
      { number: "D3", name: "D3", gpio: "3", features: ["Digital I/O", "PWM", "External Interrupt 1"], primary: "Digital I/O / PWM Output", caution: "Capable of hardware PWM at ~490Hz.", isCaution: false },
      { number: "D4", name: "D4", gpio: "4", features: ["Digital I/O"], primary: "Digital I/O", caution: "", isCaution: false },
      { number: "D5", name: "D5", gpio: "5", features: ["Digital I/O", "PWM"], primary: "Digital I/O / PWM Output", caution: "PWM frequency ~980Hz (Tied to Timer 0, duty cycle affects millis() slightly).", isCaution: false },
      { number: "D6", name: "D6", gpio: "6", features: ["Digital I/O", "PWM"], primary: "Digital I/O / PWM Output", caution: "PWM frequency ~980Hz.", isCaution: false },
      { number: "D7", name: "D7", gpio: "7", features: ["Digital I/O"], primary: "Digital I/O", caution: "", isCaution: false },
      { number: "D8", name: "D8", gpio: "8", features: ["Digital I/O"], primary: "Digital I/O", caution: "", isCaution: false },
      { number: "D9", name: "D9", gpio: "9", features: ["Digital I/O", "PWM"], primary: "Digital I/O / PWM Output", caution: "Support 8-bit precision PWM.", isCaution: false },
      { number: "D10", name: "D10", gpio: "10", features: ["Digital I/O", "PWM", "SPI_SS"], primary: "Digital I/O / SPI Slave Select", caution: "Common default CS pin for hardware shields.", isCaution: false },
      { number: "D11", name: "D11", gpio: "11", features: ["Digital I/O", "PWM", "SPI_MOSI"], primary: "Digital I/O / SPI MOSI", caution: "Shares hardware timer resources. PWM disabled if TIMER2 modified.", isCaution: false },
      { number: "D12", name: "D12", gpio: "12", features: ["Digital I/O", "SPI_MISO"], primary: "Digital I/O / SPI MISO", caution: "", isCaution: false },
      { number: "D13", name: "D13", gpio: "13", features: ["Digital I/O", "SPI_SCK", "Built-In LED"], primary: "Digital SCK / Onboard LED", caution: "Onboard yellow LED connected in series. Slight loading factor.", isCaution: false },
      { number: "GND1", name: "GND", gpio: "N/A", features: ["Ground"], primary: "System Ground", caution: "", isCaution: false },
      { number: "AREF", name: "AREF", gpio: "N/A", features: ["Analog Reference"], primary: "External Analog Reference", caution: "Do not apply external voltage here without calling analogReference(EXTERNAL) in code, otherwise you will short the internal Vcc reference.", isCaution: true },
      { number: "SDA", name: "SDA", gpio: "N/A", features: ["I2C_SDA"], primary: "I2C SDA (Duplicate)", caution: "Electrically identical to Analog A4.", isCaution: false },
      { number: "SCL", name: "SCL", gpio: "N/A", features: ["I2C_SCL"], primary: "I2C SCL (Duplicate)", caution: "Electrically identical to Analog A5.", isCaution: false },

      // Analog / Power Header pins
      { number: "A0", name: "A0", gpio: "14", features: ["Analog Input", "Digital I/O"], primary: "Analog Input 0", caution: "Can be configured as Digital PIN 14.", isCaution: false },
      { number: "A1", name: "A1", gpio: "15", features: ["Analog Input", "Digital I/O"], primary: "Analog Input 1", caution: "Can be configured as Digital PIN 15.", isCaution: false },
      { number: "A2", name: "A2", gpio: "16", features: ["Analog Input", "Digital I/O"], primary: "Analog Input 2", caution: "Can be configured as Digital PIN 16.", isCaution: false },
      { number: "A3", name: "A3", gpio: "17", features: ["Analog Input", "Digital I/O"], primary: "Analog Input 3", caution: "Can be configured as Digital PIN 17.", isCaution: false },
      { number: "A4", name: "A4 / SDA", gpio: "18", features: ["Analog Input", "I2C_SDA", "Digital I/O"], primary: "Analog In / I2C SDA", caution: "Dual purpose pin. Solder pad linked to SDA near AREF.", isCaution: false },
      { number: "A5", name: "A5 / SCL", gpio: "19", features: ["Analog Input", "I2C_SCL", "Digital I/O"], primary: "Analog In / I2C SCL", caution: "Dual purpose pin. Solder pad linked to SCL near AREF.", isCaution: false },
      
      { number: "IOREF", name: "IOREF", gpio: "N/A", features: ["Power Reference"], primary: "Board I/O Voltage", caution: "Reads 5V on standard Uno. Lets shields adapt to logical voltage dynamically.", isCaution: false },
      { number: "RST", name: "RESET", gpio: "N/A", features: ["Reset Input"], primary: "Reset Board", caution: "Tie to GND to reset ATmega controller.", isCaution: false },
      { number: "3.3V", name: "3.3V", gpio: "N/A", features: ["Power Output"], primary: "3.3V Power Out", caution: "Limited current capacity (under 150mA).", isCaution: false },
      { number: "5V", name: "5V", gpio: "N/A", features: ["Power Output"], primary: "5V Power Out", caution: "High power output. When powered from USB: limits to 500mA USB fuse.", isCaution: false },
      { number: "GND2", name: "GND", gpio: "N/A", features: ["Ground"], primary: "System Ground", caution: "", isCaution: false },
      { number: "GND3", name: "GND", gpio: "N/A", features: ["Ground"], primary: "System Ground", caution: "", isCaution: false },
      { number: "VIN", name: "VIN", gpio: "N/A", features: ["Power Input"], primary: "Raw external Vin input", caution: "Inputs safe 7-12V. Feeds into onboard internal 5V regulator.", isCaution: false }
    ]
  },
  {
    id: "arduino-nano",
    name: "Arduino Nano (V3.0)",
    description: "Miniature breadboard-friendly cousin of the Uno, packing the same ATmega328P package plus two extra analog inputs (A6, A7).",
    layoutType: "dual-inline",
    datasheetUrl: "https://docs.arduino.cc/resources/datasheets/A000005-datasheet.pdf",
    additionalResources: [
      { label: "Official Arduino Nano Hardware Docs", url: "https://docs.arduino.cc/hardware/nano/" },
      { label: "Clone Driver Guide (CH340G)", url: "https://learn.sparkfun.com/tutorials/how-to-install-ch340-drivers/all" }
    ],
    specs: {
      architecture: "AVR RISC 8-bit ATmega328P",
      clockSpeed: "16 MHz",
      operatingVoltage: "5V Logic (7-12V Vin / 5V USB)",
      flashMemory: "32 KB (2 KB used by Nano bootloader)",
      ramSize: "2 KB SRAM + 1 KB EEPROM",
      gpioCount: 14,
      adcChannels: "8 Channels (10-bit)",
      dacChannels: "None",
      interfaces: "1x UART, 1x SPI, 1x I2C, 6x Hardware PWM"
    },
    warnings: [
      "Logic Level is 5V. Do not connect 3.3V modules directly without logic level converters if they are not 5V tolerant.",
      "Input-Only Analogs: Pins A6 and A7 are dedicated strictly to the internal ADC; they possess NO digital I/O structures (cannot be configured with pinMode INPUT or OUTPUT).",
      "Power Regulators: On counterfeit/cheap clones or even official ones, feeding too much voltage into VIN (>12V) can overheat the miniature onboard regulator quickly."
    ],
    peripherals: [
      { interfaceType: "I2C", pinsUsed: "SDA: Pin A4, SCL: Pin A5" },
      { interfaceType: "SPI", pinsUsed: "MOSI: Pin D11, MISO: Pin D12, SCK: Pin D13, SS: Pin D10" },
      { interfaceType: "UART", pinsUsed: "TXD: Pin D1 (TX1), RXD: Pin D0 (RX0)" }
    ],
    pins: [
      // Left side pins (Standard vertical list Pin 1 to 15)
      { number: "1", name: "D1 / TX", gpio: "1", features: ["Digital I/O", "UART_TX"], primary: "Serial Output / Tx", caution: "Blinks during uploads.", isCaution: false },
      { number: "2", name: "D0 / RX", gpio: "0", features: ["Digital I/O", "UART_RX"], primary: "Serial Input / Rx", caution: "Disconnect when using other devices on TX/RX.", isCaution: true },
      { number: "3", name: "RST (L)", gpio: "N/A", features: ["Reset Input"], primary: "Hardware Reset", caution: "Active low button or external trigger.", isCaution: false },
      { number: "4", name: "GND (L)", gpio: "N/A", features: ["Ground"], primary: "System Ground", caution: "", isCaution: false },
      { number: "5", name: "D2", gpio: "2", features: ["Digital I/O", "Interrupt 0"], primary: "Digital Input / Interrupt", caution: "", isCaution: false },
      { number: "6", name: "D3", gpio: "3", features: ["Digital I/O", "Interrupt 1", "PWM"], primary: "Digital I/O / PWM Out", caution: "External interrupt trigger capable.", isCaution: false },
      { number: "7", name: "D4", gpio: "4", features: ["Digital I/O"], primary: "Digital Input / Output", caution: "", isCaution: false },
      { number: "8", name: "D5", gpio: "5", features: ["Digital I/O", "PWM"], primary: "Digital Input / Output / PWM", caution: "Internal Timer-0 PWM.", isCaution: false },
      { number: "9", name: "D6", gpio: "6", features: ["Digital I/O", "PWM"], primary: "Digital Input / Output / PWM", caution: "", isCaution: false },
      { number: "10", name: "D7", gpio: "7", features: ["Digital I/O"], primary: "Digital Input / Output", caution: "", isCaution: false },
      { number: "11", name: "D8", gpio: "8", features: ["Digital I/O"], primary: "Digital Input / Output", caution: "", isCaution: false },
      { number: "12", name: "D9", gpio: "9", features: ["Digital I/O", "PWM"], primary: "Digital Input / Output / PWM", caution: "", isCaution: false },
      { number: "13", name: "D10", gpio: "10", features: ["Digital I/O", "PWM", "SPI_SS"], primary: "Digital I/O / SPI SS", caution: "", isCaution: false },
      { number: "14", name: "D11", gpio: "11", features: ["Digital I/O", "PWM", "SPI_MOSI"], primary: "Digital I/O / SPI MOSI", caution: "SPI data input to slave.", isCaution: false },
      { number: "15", name: "D12", gpio: "12", features: ["Digital I/O", "SPI_MISO"], primary: "Digital I/O / SPI MISO", caution: "SPI data output from slave.", isCaution: false },
      
      // Right side pins (Standard Pin 16 to 30)
      { number: "16", name: "D13", gpio: "13", features: ["Digital I/O", "SPI_SCK", "LED"], primary: "SPI CLK / Onboard LED", caution: "Built-in green LED in series with resistor.", isCaution: false },
      { number: "17", name: "3V3", gpio: "N/A", features: ["3.3V Output"], primary: "Onboard 3.3V regul.", caution: "Sourced from USB interface chip (Max 50mA limit!). Do not feed major modules.", isCaution: true },
      { number: "18", name: "REF", gpio: "N/A", features: ["Analog Ref"], primary: "Analog comparator ref", caution: "AREF voltage trigger.", isCaution: false },
      { number: "19", name: "A0", gpio: "14", features: ["Analog Input", "Digital I/O"], primary: "Analog / Digital Pin 14", caution: "", isCaution: false },
      { number: "20", name: "A1", gpio: "15", features: ["Analog Input", "Digital I/O"], primary: "Analog / Digital Pin 15", caution: "", isCaution: false },
      { number: "21", name: "A2", gpio: "16", features: ["Analog Input", "Digital I/O"], primary: "Analog / Digital Pin 16", caution: "", isCaution: false },
      { number: "22", name: "A3", gpio: "17", features: ["Analog Input", "Digital I/O"], primary: "Analog / Digital Pin 17", caution: "", isCaution: false },
      { number: "23", name: "A4", gpio: "18", features: ["Analog Input", "I2C_SDA", "Digital I/O"], primary: "Analog In / I2C SDA", caution: "SDA pin for I2C bus.", isCaution: false },
      { number: "24", name: "A5", gpio: "19", features: ["Analog Input", "I2C_SCL", "Digital I/O"], primary: "Analog In / I2C SCL", caution: "SCL pin for I2C bus.", isCaution: false },
      { number: "25", name: "A6", gpio: "N/A", features: ["Analog Input Only"], primary: "Strict Analog input Only", caution: "Warning: Pure analog mapping. No digital driver register tied. Cannot do DigitalRead or Write.", isCaution: true },
      { number: "26", name: "A7", gpio: "N/A", features: ["Analog Input Only"], primary: "Strict Analog input Only", caution: "Warning: Pure analog mapping. No digital driver register tied. Cannot do DigitalRead or Write.", isCaution: true },
      { number: "27", name: "5V", gpio: "N/A", features: ["Power Out"], primary: "Regulated 5V Output", caution: "Clean 5V from source, or external regulated 5V in.", isCaution: false },
      { number: "28", name: "RESET (R)", gpio: "N/A", features: ["Reset Input"], primary: "Hardware Reset Pin", caution: "Duplicate of PIN 3 reset functionality.", isCaution: false },
      { number: "29", name: "GND (R)", gpio: "N/A", features: ["Ground"], primary: "GND connection", caution: "", isCaution: false },
      { number: "30", name: "VIN", gpio: "N/A", features: ["Power Input"], primary: "Raw external Vin Supply", caution: "Vin 7-12V safe feed.", isCaution: false }
    ]
  },
  {
    id: "arduino-mega",
    name: "Arduino Mega 2560 R3",
    description: "The tank of Arduino boards. Hosts 54 digital pin ports, 16 analog pin inputs, and 4 hardware UARTs, powered by the ATmega2560.",
    layoutType: "mega-headers",
    datasheetUrl: "https://docs.arduino.cc/resources/datasheets/A000067-datasheet.pdf",
    additionalResources: [
      { label: "Official Arduino Mega Guide", url: "https://docs.arduino.cc/hardware/mega-2560/" },
      { label: "ATmega2560 Chip Datasheet", url: "https://ww1.microchip.com/downloads/en/devicedoc/atmel-2549-8-bit-avr-microcontroller-atmega640-1280-1281-2560-2561_datasheet.pdf" }
    ],
    specs: {
      architecture: "AVR RISC 8-bit ATmega2560",
      clockSpeed: "16 MHz",
      operatingVoltage: "5V Logic (7-12V Input)",
      flashMemory: "256 KB (8 KB used by bootloader)",
      ramSize: "8 KB SRAM + 4 KB EEPROM",
      gpioCount: 54,
      adcChannels: "16 Channels (10-bit)",
      dacChannels: "None",
      interfaces: "4x UART, 5x SPI, 1x I2C, 15x Hardware PWM"
    },
    warnings: [
      "Operates on 5V logic. Maximum voltage safe on any digital/analog port is 5.5 volts.",
      "The massive header count can draw substantial total current from the regulator. Guard with <800mA from external plug.",
      "SPI Default Shift: SPI hardware lines are located on pins 50-53 (instead of 10-13 as in standard Uno). This breaks older shields needing hardwired SPI unless patched through ICSP header.",
      "I2C Shift: Arduino Mega positions SCL on pin 21 and SDA on pin 20, departing from Uno's location over Analog A4/A5."
    ],
    peripherals: [
      { interfaceType: "I2C", pinsUsed: "SDA: Pin 20, SCL: Pin 21" },
      { interfaceType: "SPI", pinsUsed: "MISO: Pin 50, MOSI: Pin 51, SCK: Pin 52, SS: Pin 53 (CS can be any pin)" },
      { interfaceType: "UART0 (USB Serial)", pinsUsed: "TXD0: Pin 1, RXD0: Pin 0" },
      { interfaceType: "UART1", pinsUsed: "TXD1: Pin 18, RXD1: Pin 19" },
      { interfaceType: "UART2", pinsUsed: "TXD2: Pin 16, RXD2: Pin 17" },
      { interfaceType: "UART3", pinsUsed: "TXD3: Pin 14, RXD3: Pin 15" }
    ],
    pins: [
      { number: "0", name: "D0 (RX0)", gpio: "0", features: ["Digital I/O", "UART_RXD0"], primary: "Serial 0 RX / Debug Rx", caution: "Tied to USB bridge.", isCaution: true },
      { number: "1", name: "D1 (TX0)", gpio: "1", features: ["Digital I/O", "UART_TXD0"], primary: "Serial 0 TX / Debug Tx", caution: "", isCaution: false },
      { number: "2", name: "D2 (PWM)", gpio: "2", features: ["Digital I/O", "PWM", "Interrupt 0"], primary: "Digital I/O / Interrupt 0", caution: "", isCaution: false },
      { number: "3", name: "D3 (PWM)", gpio: "3", features: ["Digital I/O", "PWM", "Interrupt 1"], primary: "Digital I/O / Interrupt 1", caution: "", isCaution: false },
      { number: "14", name: "D14 (TX3)", gpio: "14", features: ["Digital I/O", "UART_TXD3"], primary: "UART3 TX Output", caution: "Secondary serial interface.", isCaution: false },
      { number: "15", name: "D15 (RX3)", gpio: "15", features: ["Digital I/O", "UART_RXD3"], primary: "UART3 RX Input", caution: "Secondary serial interface.", isCaution: false },
      { number: "16", name: "D16 (TX2)", gpio: "16", features: ["Digital I/O", "UART_TXD2"], primary: "UART2 TX Output", caution: "Tertiary serial interface.", isCaution: false },
      { number: "17", name: "D17 (RX2)", gpio: "17", features: ["Digital I/O", "UART_RXD2"], primary: "UART2 RX Input", caution: "Tertiary serial interface.", isCaution: false },
      { number: "18", name: "D18 (TX1)", gpio: "18", features: ["Digital I/O", "UART_TXD1", "Interrupt 5"], primary: "UART1 TX / Interrupt 5", caution: "Quaternary serial interface.", isCaution: false },
      { number: "19", name: "D19 (RX1)", gpio: "19", features: ["Digital I/O", "UART_RXD1", "Interrupt 4"], primary: "UART1 RX / Interrupt 4", caution: "Quaternary serial interface.", isCaution: false },
      { number: "20", name: "D20 (SDA)", gpio: "20", features: ["Digital I/O", "I2C_SDA"], primary: "I2C SDA Port", caution: "Hardware I2C data bus.", isCaution: false },
      { number: "21", name: "D21 (SCL)", gpio: "21", features: ["Digital I/O", "I2C_SCL"], primary: "I2C SCL Port", caution: "Hardware I2C clock line.", isCaution: false },
      { number: "50", name: "D50 (MISO)", gpio: "50", features: ["Digital I/O", "SPI_MISO"], primary: "SPI MISO Bus Pin", caution: "Shifted from standard Uno mapping (pin 12).", isCaution: true },
      { number: "51", name: "D51 (MOSI)", gpio: "51", features: ["Digital I/O", "SPI_MOSI"], primary: "SPI MOSI Bus Pin", caution: "Shifted from standard Uno mapping (pin 11).", isCaution: true },
      { number: "52", name: "D52 (SCK)", gpio: "52", features: ["Digital I/O", "SPI_SCK"], primary: "SPI SCK Bus Pin", caution: "Shifted from standard Uno mapping (pin 13).", isCaution: true },
      { number: "53", name: "D53 (SS)", gpio: "53", features: ["Digital I/O", "SPI_SS"], primary: "SPI Slave Select Default CS", caution: "Must be output to maintain SPI Master mode.", isCaution: false },
      
      // Analog Header block
      { number: "A0", name: "A0 (Analog)", gpio: "54", features: ["Analog Input", "Digital I/O"], primary: "Analog Channel 0", caution: "ADC hardware channel.", isCaution: false },
      { number: "A1", name: "A1 (Analog)", gpio: "55", features: ["Analog Input", "Digital I/O"], primary: "Analog Channel 1", caution: "", isCaution: false },
      { number: "A15", name: "A15 (Analog)", gpio: "69", features: ["Analog Input", "Digital I/O"], primary: "Analog Channel 15", caution: "Highest analog port index.", isCaution: false },
      
      // Power / Ground pins
      { number: "VCC", name: "5V Power", gpio: "N/A", features: ["Power Out"], primary: "System 5V Rail output", caution: "Directly supplies 5V standard level.", isCaution: false },
      { number: "GND", name: "GND", gpio: "N/A", features: ["Ground"], primary: "System Ground", caution: "", isCaution: false },
      { number: "VIN", name: "VIN Input", gpio: "N/A", features: ["Power Input"], primary: "External 7-12V Input DC Plug line", caution: "Connect external standard adapter for battery or socket supply.", isCaution: false }
    ]
  },
  {
    id: "esp8266-nodemcu",
    name: "NodeMCU v3 (ESP8266)",
    description: "Extremely popular cost-effective Wi-Fi enabled single-core chip. Highly suitable for basic IoT smart appliances and telemetry nodes.",
    layoutType: "dual-inline",
    datasheetUrl: "https://www.espressif.com/sites/default/files/documentation/0a-esp8266ex_datasheet_en.pdf",
    additionalResources: [
      { label: "ESP8266 Hardware Guide", url: "https://docs.espressif.com/projects/esp-at/en/release-v2.2.0.0_esp8266/Hardware_connection/ESP8266_Boards.html" }
    ],
    specs: {
      architecture: "Tensilica L106 32-bit",
      clockSpeed: "80 MHz (Overclockable to 160 MHz)",
      operatingVoltage: "3.3V Logic Level Only",
      flashMemory: "4 MB",
      ramSize: "80 KB User RAM + 50 KB system RAM",
      gpioCount: 17,
      adcChannels: "1 Channel (10-bit, 0-1V raw / 0-3.3V on NodeMCU board)",
      dacChannels: "None",
      interfaces: "1x UART, 1x SPI, 1x I2C (software-driven), SDIO"
    },
    warnings: [
      "No 5V input: Supply ONLY 3.3V to GPIO pins, as 5V over-injection will degrade or fry the silicon gates.",
      "Single ADC Pin (A0): Only 1 analog input port exists on the entire board, labeled A0. Maximum input is 3.3V due to the internal board voltage divider instead of 1V raw.",
      "GPIO 15 Boot Lock: Must be pulled LOW during boot, otherwise the ESP8266 fails to execute from flash.",
      "GPIO 0 and GPIO 2 Boot State: GPIO 0 must be high on boot to run flashed app, or low to enter programming mode. GPIO 2 must be high on boot."
    ],
    peripherals: [
      { interfaceType: "I2C (Software default)", pinsUsed: "SDA: D2 (GPIO4), SCL: D1 (GPIO5)" },
      { interfaceType: "SPI", pinsUsed: "MISO: D6 (GPIO12), MOSI: D7 (GPIO13), CLK: D5 (GPIO14), SS: D4 (GPIO2)" },
      { interfaceType: "UART", pinsUsed: "TXD0: TX (GPIO1), RXD0: RX (GPIO3)" }
    ],
    pins: [
      { number: "1", name: "A0", gpio: "3.3V_ADC", features: ["Analog Input", "ADC0"], primary: "Analog Input 0", caution: "0 to 3.3.V range limit due to internal divider.", isCaution: false },
      { number: "2", name: "GND", gpio: "N/A", features: ["Ground"], primary: "Ground Reference", isCaution: false },
      { number: "3", name: "3V3", gpio: "N/A", features: ["Power Out"], primary: "Regulated 3.3V Output", isCaution: false },
      { number: "4", name: "D0 (GPIO16)", gpio: "16", features: ["GPIO", "Wakeup"], primary: "GPIO / Deep Sleep Wake", caution: "Connect to RST to enable deep sleep wakeup.", isCaution: true },
      { number: "5", name: "D1 (GPIO5)", gpio: "5", features: ["GPIO", "I2C_SCL"], primary: "I2C SCL", isCaution: false },
      { number: "6", name: "D2 (GPIO4)", gpio: "4", features: ["GPIO", "I2C_SDA"], primary: "I2C SDA", isCaution: false },
      { number: "7", name: "D3 (GPIO0)", gpio: "0", features: ["GPIO", "FLASH_Pin"], primary: "Strapping Pin / Flash key", caution: "Must be HIGH on boot. Active low manually launches bootloader.", isCaution: true },
      { number: "8", name: "D4 (GPIO2)", gpio: "2", features: ["GPIO", "TXD1", "LED"], primary: "Strapping Pin / Onboard Blue LED", caution: "Must be HIGH on boot. Active low blue LED.", isCaution: false },
      { number: "9", name: "3V3", gpio: "N/A", features: ["Power Out"], primary: "Regulated 3.3V Output", isCaution: false },
      { number: "10", name: "GND", gpio: "N/A", features: ["Ground"], primary: "Ground Reference" },
      { number: "11", name: "D5 (GPIO14)", gpio: "14", features: ["GPIO", "HSPI_CLK"], primary: "SPI SCK" },
      { number: "12", name: "D6 (GPIO12)", gpio: "12", features: ["GPIO", "HSPI_MISO"], primary: "SPI MISO" },
      { number: "13", name: "D7 (GPIO13)", gpio: "13", features: ["GPIO", "HSPI_MOSI"], primary: "SPI MOSI" },
      { number: "14", name: "D8 (GPIO15)", gpio: "15", features: ["GPIO", "HSPI_CS", "TXD2"], primary: "SPI CS / Strap Pin", caution: "Must be LOW on boot. Connect pull-down resistor.", isCaution: true },
      { number: "15", name: "TX (GPIO1)", gpio: "1", features: ["UART0_TXD", "GPIO"], primary: "Serial Link Transmit TX", caution: "Flickers on programmers upload.", isCaution: false },
      { number: "16", name: "RX (GPIO3)", gpio: "3", features: ["UART0_RXD", "GPIO"], primary: "Serial Link Receive RX", caution: "Locked for programmer communications.", isCaution: false },
      { number: "17", name: "RST", gpio: "N/A", features: ["Reset Input"], primary: "Hardware Reset pin", caution: "Pull-down triggers system reboot.", isCaution: false },
      { number: "18", name: "VIN", gpio: "N/A", features: ["Power Input"], primary: "External regular 5V in", caution: "Outputs standard safe feed.", isCaution: false }
    ]
  },
  {
    id: "esp32-s3",
    name: "ESP32-S3 DevKitC-1",
    description: "Modern, high-performance Espressif SoC featuring Vector Instructions for AI acceleration, native USB OTG, and dual-core Xtensa LX7 CPU.",
    layoutType: "dual-inline",
    datasheetUrl: "https://www.espressif.com/sites/default/files/documentation/esp32-s3_datasheet_en.pdf",
    additionalResources: [
      { label: "ESP32-S3 Technical Reference", url: "https://www.espressif.com/sites/default/files/documentation/esp32-s3_technical_reference_manual_en.pdf" }
    ],
    specs: {
      architecture: "Xtensa 32-bit LX7 Dual-Core",
      clockSpeed: "240 MHz",
      operatingVoltage: "3.3V Logic level",
      flashMemory: "8 MB / 16 MB",
      ramSize: "512 KB SRAM + 8 MB PSRAM octal",
      gpioCount: 45,
      adcChannels: "20 Channels (12-bit ADC1/ADC2)",
      dacChannels: "None",
      interfaces: "4x SPI, 2x I2C, 2x I2S, 3x UART, TWAI (CAN), PWM, LCD/Camera"
    },
    warnings: [
      "Logic Level is 3.3V strictly. Pin structure does not accept 5.0V injections.",
      "USB OTG Pins: GPIO 19 (D-) and GPIO 20 (D+) are wired directly to native USB channel. Avoid high load lines.",
      "PSRAM Interference: Octal SPI FLASH/PSRAM models reserve GPIOs 35, 36, and 37. Do not route general purpose GPIOs here.",
      "Strap pins: GPIO 0 and GPIO 46 are critical bootstrap states. Verify signal floats on boot."
    ],
    peripherals: [
      { interfaceType: "I2C0", pinsUsed: "SDA: GPIO8, SCL: GPIO9" },
      { interfaceType: "SPI2 (FSPI)", pinsUsed: "MOSI: GPIO11, MISO: GPIO13, SCK: GPIO12, CS: GPIO10" },
      { interfaceType: "UART0 (Log/Debug)", pinsUsed: "TXD: GPIO43, RXD: GPIO44" },
      { interfaceType: "Native USB OTG", pinsUsed: "D-: GPIO19, D+: GPIO20" }
    ],
    pins: [
      { number: "1", name: "3V3", gpio: "N/A", features: ["Power out"], primary: "Regulated 3.3V Out", isCaution: false },
      { number: "2", name: "EN", gpio: "N/A", features: ["System Enable", "CHIP_PU"], primary: "Hardware reboot", isCaution: false },
      { number: "3", name: "G1", gpio: "1", features: ["GPIO", "ADC1_CH0", "Touch1"], primary: "Digital Input / Touch Input" },
      { number: "4", name: "G2", gpio: "2", features: ["GPIO", "ADC1_CH1", "Touch2"], primary: "Digital Input / Touch Input" },
      { number: "5", name: "G8", gpio: "8", features: ["GPIO", "I2C0_SDA"], primary: "I2C0 SDA Bus default" },
      { number: "6", name: "G9", gpio: "9", features: ["GPIO", "I2C0_SCL"], primary: "I2C0 SCL Bus default" },
      { number: "7", name: "G19", gpio: "19", features: ["GPIO", "USB_D-"], primary: "Native USB D- Pin", caution: "Linked to USB OTG controller.", isCaution: true },
      { number: "8", name: "G20", gpio: "20", features: ["GPIO", "USB_D+"], primary: "Native USB D+ Pin", caution: "Linked to USB OTG controller.", isCaution: true },
      { number: "9", name: "GND", gpio: "N/A", features: ["Ground"], primary: "GND Reference" },
      { number: "10", name: "5V", gpio: "N/A", features: ["Power input/output"], primary: "External USB power (5V Vin)", isCaution: false }
    ]
  },
  {
    id: "arduino-leonardo",
    name: "Arduino Leonardo",
    description: "Atmega32u4-powered development board. Features built-in native USB support, presenting itself as a keyboard, mouse, or virtual MIDI interface.",
    layoutType: "arduino-headers",
    datasheetUrl: "https://docs.arduino.cc/resources/datasheets/A000057-datasheet.pdf",
    additionalResources: [
      { label: "Leonardo Official Guide", url: "https://docs.arduino.cc/hardware/leonardo/" },
      { label: "Keyboard & Mouse API tutorial", url: "https://www.arduino.cc/reference/en/language/functions/usb/keyboard/" }
    ],
    specs: {
      architecture: "AVR RISC 8-bit ATmega32U4",
      clockSpeed: "16 MHz",
      operatingVoltage: "5V Logic level (7-12V Input)",
      flashMemory: "32 KB (4 KB used by bootloader)",
      ramSize: "2.5 KB SRAM + 1 KB EEPROM",
      gpioCount: 20,
      adcChannels: "12 Channels (10-bit)",
      dacChannels: "None",
      interfaces: "1x UART, 1x SPI, 1x I2C, 7x PWM channels, native USB HID mouse/keyboard"
    },
    warnings: [
      "Operates on 5V logic. Do not connect low tension 3.3V sensors directly.",
      "Hardware Serial TX & RX mapping: Serial (USB) communicates with computer dynamically; Serial1 (USART1) utilizes pin 0 (RX) and pin 1 (TX) independently without blocking USB uploads.",
      "I2C Bus layout: SCL is mapped on Pin 3 and SDA is mapped on Pin 2. Departure from classic Uno mapping (A4/A5)."
    ],
    peripherals: [
      { interfaceType: "I2C Hardware", pinsUsed: "SDA: Pin 2, SCL: Pin 3" },
      { interfaceType: "SPI (Only on ICSP header)", pinsUsed: "MISO: ICSP-1, MOSI: ICSP-4, SCK: ICSP-3" },
      { interfaceType: "UART1 (Independent)", pinsUsed: "TXD1: Pin 1, RXD1: Pin 0" },
      { interfaceType: "PWM", pinsUsed: "Pins 3, 5, 6, 9, 10, 11, 13" }
    ],
    pins: [
      // Digital Header Pinouts
      { number: "D0", name: "D0 / RX1", gpio: "0", features: ["Digital I/O", "UART1_RX1", "Interrupt 2"], primary: "Independent Hardware Serial RX1", isCaution: false },
      { number: "D1", name: "D1 / TX1", gpio: "1", features: ["Digital I/O", "UART1_TX1", "Interrupt 3"], primary: "Independent Hardware Serial TX1", isCaution: false },
      { number: "D2", name: "D2 / SDA", gpio: "2", features: ["Digital I/O", "I2C_SDA", "Interrupt 1"], primary: "Hardware I2C SDA", caution: "Do not use A4 for I2C.", isCaution: true },
      { number: "D3", name: "D3 / SCL", gpio: "3", features: ["Digital I/O", "I2C_SCL", "PWM", "Interrupt 0"], primary: "Hardware I2C SCL / PWM", caution: "Do not use A5 for I2C.", isCaution: true },
      { number: "D4", name: "D4 / A6", gpio: "4", features: ["Digital I/O", "Analog Input 6"], primary: "Digital I/O or Analog Input A6" },
      { number: "D5", name: "D5 / PWM", gpio: "5", features: ["Digital I/O", "PWM"], primary: "PWM output" },
      { number: "D6", name: "D6 / A7 / PWM", gpio: "6", features: ["Digital I/O", "Analog Input 7", "PWM"], primary: "Analog Input A7 or PWM out" },
      { number: "D7", name: "D7", gpio: "7", features: ["Digital I/O", "Interrupt 4"], primary: "Digital I/O" },
      { number: "D8", name: "D8 / A8", gpio: "8", features: ["Digital I/O", "Analog Input 8"], primary: "Analog Input A8" },
      { number: "D9", name: "D9 / A9 / PWM", gpio: "9", features: ["Digital I/O", "Analog Input 9", "PWM"], primary: "Analog Input A9 or PWM out" },
      { number: "D10", name: "D10 / A10 / PWM", gpio: "10", features: ["Digital I/O", "Analog Input 10", "PWM"], primary: "Analog Input A10 or PWM out" },
      { number: "D11", name: "D11 / PWM", gpio: "11", features: ["Digital I/O", "PWM"], primary: "PWM output" },
      { number: "D12", name: "D12 / A11", gpio: "12", features: ["Digital I/O", "Analog Input A11"], primary: "Analog Input A11" },
      { number: "D13", name: "D13 / PWM / LED", gpio: "13", features: ["Digital I/O", "PWM", "Onboard LED"], primary: "Onboard amber LED / PWM Out" },
      { number: "GND1", name: "GND", gpio: "N/A", features: ["Ground"], primary: "System Ground" },
      { number: "AREF", name: "AREF", gpio: "N/A", features: ["AREF Input"], primary: "Analog Reference" },
      
      // Analog Header block
      { number: "A0", name: "A0", gpio: "14", features: ["Analog Input", "Digital I/O"], primary: "Analog Input 0" },
      { number: "A1", name: "A1", gpio: "15", features: ["Analog Input", "Digital I/O"], primary: "Analog Input 1" },
      { number: "A5", name: "A5", gpio: "19", features: ["Analog Input", "Digital I/O"], primary: "Analog Input 5" },
      { number: "RESET", name: "RESET", gpio: "N/A", features: ["Reset Button"], primary: "Reset micro on double tap" },
      { number: "5V", name: "5V Power Out", gpio: "N/A", features: ["5V Positive Out"], primary: "Out safe level VCC" },
      { number: "3V3", name: "3.3V Power Out", gpio: "N/A", features: ["3.3V Output"], primary: "Outputs clean regulated 3V3" },
      { number: "GND2", name: "GND", gpio: "N/A", features: ["Ground"], primary: "System Ground" },
      { number: "VIN", name: "VIN Input", gpio: "N/A", features: ["Power input"], primary: "Vin battery connector" }
    ]
  }
];

