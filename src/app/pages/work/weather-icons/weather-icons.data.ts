// Generated from the original Adobe XD exports (Desktop/weather icons). Do not edit by hand.
// 25 icons on the original 146px tile, in the order of the Dribbble shot (5 per row).
// Colors are the artwork's own palette (content, not UI), shown as swatches.

export interface WeatherIcon {
  id: string;
  name: string;
  group: string;
  /** Painted fills, lowercase hex. */
  colors: string[];
  /** Number of drawn shapes. */
  shapes: number;
  /** Size of the static SVG file in bytes. */
  bytes: number;
  /** Size of the animated SVG file (animated/<id>.svg) in bytes. */
  animatedBytes: number;
  /** Keyframes the animated file uses. */
  motion: string[];
}

export const WEATHER_ICONS_DIR = '/images/weather-icons';
export const WEATHER_TILE = 146;

export const WEATHER_ICONS: WeatherIcon[] = [
  {
    id: 'cloud',
    name: 'Cloud',
    group: 'Clouds',
    colors: [
      '#e8e8e8'
    ],
    shapes: 1,
    bytes: 1143,
    animatedBytes: 1420,
    motion: [
      'float'
    ]
  },
  {
    id: 'mild-cloud',
    name: 'Mild cloud',
    group: 'Clouds',
    colors: [
      '#3b3b47',
      '#e8e8e8'
    ],
    shapes: 2,
    bytes: 1507,
    animatedBytes: 1939,
    motion: [
      'drift',
      'float'
    ]
  },
  {
    id: 'rainy',
    name: 'Rainy',
    group: 'Rain and snow',
    colors: [
      '#62626b',
      '#4188b2',
      '#53bbf3'
    ],
    shapes: 5,
    bytes: 2014,
    animatedBytes: 2669,
    motion: [
      'float',
      'fall'
    ]
  },
  {
    id: 'thunderstorm',
    name: 'Thunderstorm',
    group: 'Storm',
    colors: [
      '#62626b',
      '#ffcc33',
      '#fc9601'
    ],
    shapes: 3,
    bytes: 1886,
    animatedBytes: 2362,
    motion: [
      'float',
      'flash'
    ]
  },
  {
    id: 'heavy-cloud',
    name: 'Heavy cloud',
    group: 'Clouds',
    colors: [
      '#3b3b47',
      '#62626b'
    ],
    shapes: 2,
    bytes: 1510,
    animatedBytes: 1942,
    motion: [
      'drift',
      'float'
    ]
  },
  {
    id: 'windy',
    name: 'Windy',
    group: 'Wind',
    colors: [
      '#e8e8e8',
      '#087830',
      '#62626b',
      '#3b3b47'
    ],
    shapes: 6,
    bytes: 3145,
    animatedBytes: 3894,
    motion: [
      'float',
      'gust',
      'flutter'
    ]
  },
  {
    id: 'snowing',
    name: 'Snowing',
    group: 'Rain and snow',
    colors: [
      '#e8e8e8',
      '#62626b',
      '#3b3b47'
    ],
    shapes: 16,
    bytes: 11510,
    animatedBytes: 12150,
    motion: [
      'float',
      'spin',
      'twinkle'
    ]
  },
  {
    id: 'heavy-rain',
    name: 'Heavy rain',
    group: 'Rain and snow',
    colors: [
      '#3b3b47',
      '#62626b',
      '#4188b2',
      '#53bbf3'
    ],
    shapes: 6,
    bytes: 2378,
    animatedBytes: 3208,
    motion: [
      'drift',
      'float',
      'fall'
    ]
  },
  {
    id: 'partly-sunny',
    name: 'Partly sunny',
    group: 'Sun and moon',
    colors: [
      '#ffcc33',
      '#fc9601',
      '#e8e8e8'
    ],
    shapes: 10,
    bytes: 2704,
    animatedBytes: 3118,
    motion: [
      'spin',
      'float'
    ]
  },
  {
    id: 'cloudy-night',
    name: 'Cloudy night',
    group: 'Sun and moon',
    colors: [
      '#939399',
      '#e8e8e8'
    ],
    shapes: 2,
    bytes: 1707,
    animatedBytes: 2130,
    motion: [
      'rock',
      'float'
    ]
  },
  {
    id: 'leaf',
    name: 'Leaf',
    group: 'Wind',
    colors: [
      '#087830'
    ],
    shapes: 1,
    bytes: 1145,
    animatedBytes: 1446,
    motion: [
      'sway'
    ]
  },
  {
    id: 'location',
    name: 'Location pointer',
    group: 'Navigation',
    colors: [
      '#af2d2d'
    ],
    shapes: 1,
    bytes: 544,
    animatedBytes: 841,
    motion: [
      'bounce'
    ]
  },
  {
    id: 'water-drop',
    name: 'Water drop',
    group: 'Rain and snow',
    colors: [
      '#53bbf3'
    ],
    shapes: 1,
    bytes: 332,
    animatedBytes: 657,
    motion: [
      'drip'
    ]
  },
  {
    id: 'thunder',
    name: 'Thunder',
    group: 'Storm',
    colors: [
      '#ffcc33',
      '#fc9601'
    ],
    shapes: 2,
    bytes: 867,
    animatedBytes: 1189,
    motion: [
      'flash'
    ]
  },
  {
    id: 'mist',
    name: 'Mist',
    group: 'Clouds',
    colors: [
      '#3b3b47'
    ],
    shapes: 1,
    bytes: 475,
    animatedBytes: 753,
    motion: [
      'drift'
    ]
  },
  {
    id: 'wind',
    name: 'Wind',
    group: 'Wind',
    colors: [
      '#087830',
      '#62626b',
      '#3b3b47'
    ],
    shapes: 17,
    bytes: 5420,
    animatedBytes: 6474,
    motion: [
      'gust',
      'flutter'
    ]
  },
  {
    id: 'navigation',
    name: 'Navigation',
    group: 'Navigation',
    colors: [
      '#af2d2d'
    ],
    shapes: 1,
    bytes: 471,
    animatedBytes: 751,
    motion: [
      'nudge'
    ]
  },
  {
    id: 'umbrella',
    name: 'Umbrella',
    group: 'Rain and snow',
    colors: [
      '#3b3b47',
      '#4188b2',
      '#e8e8e8'
    ],
    shapes: 4,
    bytes: 1072,
    animatedBytes: 1372,
    motion: [
      'sway'
    ]
  },
  {
    id: 'sun',
    name: 'Sun',
    group: 'Sun and moon',
    colors: [
      '#ffcc33',
      '#fc9601'
    ],
    shapes: 9,
    bytes: 1474,
    animatedBytes: 1878,
    motion: [
      'pulse',
      'spin'
    ]
  },
  {
    id: 'moon',
    name: 'Moon',
    group: 'Sun and moon',
    colors: [
      '#939399'
    ],
    shapes: 1,
    bytes: 701,
    animatedBytes: 970,
    motion: [
      'rock'
    ]
  },
  {
    id: 'snowflake',
    name: 'Snowflake',
    group: 'Rain and snow',
    colors: [
      '#62626b',
      '#3b3b47'
    ],
    shapes: 15,
    bytes: 10511,
    animatedBytes: 11002,
    motion: [
      'spin',
      'twinkle'
    ]
  },
  {
    id: 'hot',
    name: 'Hot',
    group: 'Temperature',
    colors: [
      '#3f1f29',
      '#af2d2d'
    ],
    shapes: 4,
    bytes: 733,
    animatedBytes: 1141,
    motion: [
      'glow',
      'rise'
    ]
  },
  {
    id: 'cold',
    name: 'Cold',
    group: 'Temperature',
    colors: [
      '#24354a',
      '#4188b2'
    ],
    shapes: 4,
    bytes: 734,
    animatedBytes: 1141,
    motion: [
      'glow',
      'sink'
    ]
  },
  {
    id: 'sunrise',
    name: 'Sunrise',
    group: 'Sun and moon',
    colors: [
      '#ffcc33',
      '#62626b',
      '#3b3b47'
    ],
    shapes: 3,
    bytes: 1393,
    animatedBytes: 1819,
    motion: [
      'dawn'
    ]
  },
  {
    id: 'clear-night',
    name: 'Clear night',
    group: 'Sun and moon',
    colors: [
      '#939399',
      '#e8e8e8',
      '#62626b',
      '#3b3b47'
    ],
    shapes: 4,
    bytes: 1734,
    animatedBytes: 2284,
    motion: [
      'rock',
      'twinkle'
    ]
  }
];

/** Every color used across the set, in order of first use. */
export const WEATHER_PALETTE: string[] = ['#e8e8e8', '#3b3b47', '#62626b', '#4188b2', '#53bbf3', '#ffcc33', '#fc9601', '#087830', '#939399', '#af2d2d', '#3f1f29', '#24354a'];
