// The brands on the shared storefront template. Palettes, fonts, Angular versions and template generations come
// from each brand's repo; towns only where the repo states them. Menus and prices are samples: the menus lived
// in the (now offline) API, never in the frontends. Prices in euros, pizza sizes 26 and 32 cm.

export interface Item {
  name: string;
  desc: string;
  /** One price, or [26 cm, 32 cm]. */
  price: number | [number, number];
}

export interface Category {
  name: string;
  items: Item[];
}

export interface Brand {
  id: string;
  name: string;
  town?: string;
  /** Template generation: 1 = Angular 13 + Scully, 2 = Angular 14. */
  gen: 1 | 2;
  angular: string;
  /** The brand's own theme colours, from its SCSS. */
  palette: string[];
  font: string;
  /** Demo colours: a fill with its text colour (4.5:1 or more), and a text tone readable on white. */
  fill: string;
  onFill: string;
  text: string;
  logo: string;
  menu: Category[];
}

const PIZZA = {
  margherita: { name: 'Margherita', desc: 'Tomato sauce, mozzarella, basil', price: [8.5, 10.9] },
  salami: { name: 'Salami', desc: 'Tomato sauce, mozzarella, beef salami', price: [9.5, 11.9] },
  funghi: { name: 'Funghi', desc: 'Tomato sauce, mozzarella, mushrooms', price: [9.5, 11.9] },
  diavolo: { name: 'Diavolo', desc: 'Spicy salami, jalapeños, chilli oil', price: [10.5, 12.9] },
  formaggi: { name: 'Quattro Formaggi', desc: 'Mozzarella, gorgonzola, parmesan, edamer', price: [10.9, 13.5] },
  tonno: { name: 'Tonno', desc: 'Tuna, red onion, olives', price: [10.5, 12.9] },
} satisfies Record<string, Item>;

const DRINKS: Category = {
  name: 'Drinks',
  items: [
    { name: 'Cola 0.33 l', desc: 'Chilled can', price: 2.5 },
    { name: 'Ayran 0.25 l', desc: 'Salted yoghurt drink', price: 2 },
    { name: 'Water 0.5 l', desc: 'Still or sparkling', price: 2 },
  ],
};

export const BRANDS: Brand[] = [
  {
    id: 'joker',
    name: 'Joker Pizza',
    gen: 2,
    angular: '14',
    palette: ['#ea3600', '#fccc4c', '#00a850', '#383838'],
    font: 'Metropolis, Open Sans Condensed',
    fill: '#d03000',
    onFill: '#ffffff',
    text: '#b52a00',
    logo: '/images/pizzerias/logos/joker.webp',
    menu: [
      { name: 'Pizza', items: [PIZZA.margherita, PIZZA.salami, PIZZA.diavolo] },
      {
        name: 'Burgers',
        items: [
          { name: 'Joker Burger', desc: 'Double beef, cheddar, jalapeños', price: 10.9 },
          { name: 'Chicken Burger', desc: 'Crispy chicken, coleslaw', price: 8.9 },
          { name: 'Cheeseburger', desc: 'Beef, cheddar, pickles', price: 8.5 },
        ],
      },
      DRINKS,
    ],
  },
  {
    id: 'turtles',
    name: 'Turtles Pizza',
    gen: 2,
    angular: '14',
    palette: ['#ea3600', '#fccc4c', '#00a850', '#383838'],
    font: 'Metropolis, Open Sans Condensed',
    fill: '#007a3a',
    onFill: '#ffffff',
    text: '#007a3a',
    logo: '/images/pizzerias/logos/turtles.webp',
    menu: [
      {
        name: 'Pizza',
        items: [PIZZA.margherita, PIZZA.funghi, { name: 'Turtle Special', desc: 'Salami, ham, peppers, mushrooms', price: [12.9, 14.9] }],
      },
      {
        name: 'Pasta',
        items: [
          { name: 'Spaghetti Bolognese', desc: 'Beef ragù, parmesan', price: 9.5 },
          { name: 'Penne Arrabbiata', desc: 'Tomato, garlic, chilli', price: 8.9 },
          { name: 'Lasagne', desc: 'Baked, béchamel', price: 10.5 },
        ],
      },
      {
        name: 'Salads',
        items: [
          { name: 'Insalata Mista', desc: 'Leaves, tomato, cucumber', price: 7.5 },
          { name: 'Tuna Salad', desc: 'Tuna, egg, olives', price: 9.5 },
          { name: 'Caprese', desc: 'Tomato, mozzarella, basil', price: 8.5 },
        ],
      },
    ],
  },
  {
    id: 'roma',
    name: 'Pizzeria Roma',
    town: 'Schlangenbad',
    gen: 2,
    angular: '14',
    palette: ['#ea3600', '#fccc4c', '#ffcd05', '#00a850', '#333333'],
    font: 'Poppins, Metropolis',
    fill: '#ffcd05',
    onFill: '#1a1a1a',
    text: '#7a5a00',
    logo: '/images/pizzerias/logos/roma.webp',
    menu: [
      { name: 'Pizza', items: [PIZZA.margherita, PIZZA.salami, PIZZA.formaggi] },
      {
        name: 'Stripes and Wings',
        items: [
          { name: 'Chicken Stripes', desc: '6 pieces, two dips', price: 7.9 },
          { name: 'Chicken Wings', desc: '8 pieces, hot or BBQ', price: 8.9 },
          { name: 'Mozzarella Sticks', desc: '6 pieces, tomato dip', price: 6.5 },
        ],
      },
      DRINKS,
    ],
  },
  {
    id: 'cloud-kitchen',
    name: 'Cloud Kitchen',
    gen: 2,
    angular: '14',
    palette: ['#ea3600', '#ffc500', '#00b737', '#242424', '#fff9e4'],
    font: 'Poppins, Hello Mogels',
    fill: '#242424',
    onFill: '#ffc500',
    text: '#b52a00',
    logo: '/images/pizzerias/logos/cloud-kitchen.webp',
    menu: [
      {
        name: 'Burgers',
        items: [
          { name: 'Smash Burger', desc: 'Two smashed patties, cheddar', price: 10.9 },
          { name: 'Crispy Chicken', desc: 'Buttermilk chicken, slaw', price: 9.9 },
          { name: 'Veggie Burger', desc: 'Bean patty, avocado', price: 9.5 },
        ],
      },
      {
        name: 'Bowls',
        items: [
          { name: 'Teriyaki Chicken', desc: 'Rice, edamame, sesame', price: 11.9 },
          { name: 'Falafel Bowl', desc: 'Hummus, couscous, salad', price: 10.5 },
          { name: 'Salmon Poke', desc: 'Rice, mango, avocado', price: 12.9 },
        ],
      },
      { name: 'Pizza', items: [PIZZA.margherita, PIZZA.diavolo, PIZZA.tonno] },
    ],
  },
  {
    id: 'mannosalwa',
    name: 'Mannosalwa',
    town: 'Mörlenbach',
    gen: 1,
    angular: '13',
    palette: ['#f7b53e', '#e2a534', '#383838', '#292933'],
    font: 'Nanum Gothic',
    fill: '#f7b53e',
    onFill: '#1a1a1a',
    text: '#7a5a00',
    logo: '/images/pizzerias/logos/mannosalwa.webp',
    menu: [
      {
        name: 'Pizza',
        items: [PIZZA.margherita, { name: 'Chicken Tikka Pizza', desc: 'Tikka chicken, peppers, onion', price: [11.5, 13.9] }, PIZZA.tonno],
      },
      {
        name: 'Grill',
        items: [
          { name: 'Chicken Tikka', desc: 'Charcoal grilled, naan, raita', price: 12.9 },
          { name: 'Seekh Kebab', desc: 'Minced lamb, salad, naan', price: 13.5 },
          { name: 'Chicken Karahi', desc: 'Tomato, ginger, green chilli', price: 14.9 },
        ],
      },
      {
        name: 'Drinks',
        items: [
          { name: 'Mango Lassi', desc: 'Yoghurt, mango', price: 3.5 },
          { name: 'Cola 0.33 l', desc: 'Chilled can', price: 2.5 },
          { name: 'Water 0.5 l', desc: 'Still or sparkling', price: 2 },
        ],
      },
    ],
  },
  {
    id: 'pinseria',
    name: 'Pinseria',
    town: 'Mörlenbach',
    gen: 1,
    angular: '14',
    palette: ['#ea3600', '#ea601d', '#fccd76', '#008926'],
    font: 'KG Blank Space Sketch',
    fill: '#b8462a',
    onFill: '#ffffff',
    text: '#b8462a',
    logo: '/images/pizzerias/logos/pinseria.webp',
    menu: [
      {
        name: 'Pinsa',
        items: [
          { name: 'Pinsa Romana', desc: 'Tomato, fior di latte, basil', price: 9.9 },
          { name: 'Pinsa Prosciutto', desc: 'Parma ham, rocket, parmesan', price: 12.5 },
          { name: 'Pinsa Burrata', desc: 'Burrata, cherry tomato, pesto', price: 13.9 },
        ],
      },
      { name: 'Pizza', items: [PIZZA.margherita, PIZZA.funghi, PIZZA.formaggi] },
      {
        name: 'Dolci',
        items: [
          { name: 'Tiramisu', desc: 'Mascarpone, espresso', price: 5.5 },
          { name: 'Panna Cotta', desc: 'Berry sauce', price: 4.9 },
          { name: 'Cannoli', desc: 'Ricotta, pistachio', price: 4.5 },
        ],
      },
    ],
  },
  {
    id: 'speed',
    name: 'Speed Pizza Döner',
    gen: 1,
    angular: '13',
    palette: ['#ea601d', '#f4a259', '#f25c66', '#1d2228'],
    font: 'Oswald',
    fill: '#ea601d',
    onFill: '#1a1a1a',
    text: '#a33d1c',
    logo: '/images/pizzerias/logos/speed.webp',
    menu: [
      {
        name: 'Döner',
        items: [
          { name: 'Döner Kebab', desc: 'Bread, salad, garlic sauce', price: 7.5 },
          { name: 'Dürüm', desc: 'Wrap, salad, chilli sauce', price: 8 },
          { name: 'Döner Plate', desc: 'Fries or rice, salad', price: 11.5 },
        ],
      },
      {
        name: 'Pizza',
        items: [
          PIZZA.margherita,
          { name: 'Sucuk', desc: 'Turkish beef sausage, peppers', price: [10.5, 12.9] },
          { name: 'Döner Pizza', desc: 'Döner meat, onion, garlic sauce', price: [11.5, 13.9] },
        ],
      },
      DRINKS,
    ],
  },
];

/** Delivery areas: each has its own fee and minimum order, as the real area list does. Samples. */
export const AREAS = [
  { id: 'a1', label: 'Area 1, under 3 km', fee: 0, min: 15 },
  { id: 'a2', label: 'Area 2, 3 to 6 km', fee: 2.5, min: 20 },
  { id: 'a3', label: 'Area 3, 6 to 10 km', fee: 3.5, min: 30 },
];

export const eur = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
