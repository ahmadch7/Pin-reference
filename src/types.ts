export interface BoardSpec {
  architecture: string;
  clockSpeed: string;
  operatingVoltage: string;
  flashMemory: string;
  ramSize: string;
  gpioCount: number;
  adcChannels: string;
  dacChannels: string;
  interfaces: string;
}

export interface BoardPin {
  number: string;
  name: string;
  gpio: string;
  features: string[];
  primary: string;
  caution?: string;
  isCaution?: boolean;
}

export interface BoardPeripheral {
  interfaceType: string;
  pinsUsed: string;
}

export interface MicrocontrollerBoard {
  id: string;
  name: string;
  description: string;
  specs: BoardSpec;
  pins: BoardPin[];
  warnings: string[];
  peripherals?: BoardPeripheral[];
  layoutType: 'dual-inline' | 'arduino-headers' | 'mega-headers';
  datasheetUrl?: string;
  additionalResources?: { label: string; url: string }[];
}
