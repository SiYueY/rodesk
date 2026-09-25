export interface JoystickAxes {
  x: number;
  y: number;
}

export interface JoystickState extends JoystickAxes {
  active: boolean;
}

export type JoystickSource = 'left' | 'right';

export interface JoystickCommand extends JoystickAxes {
  source: JoystickSource;
  timestamp: number;
}
