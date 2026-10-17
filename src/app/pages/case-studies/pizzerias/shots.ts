// Storefront screenshots for the pizzerias case study, made by scripts/pizzerias-shots.mjs: the original
// production builds, served locally and answered by a sample API (the live sites and their API are offline).

export interface Shot {
  src: string;
  w: number;
  h: number;
  alt: string;
  cap?: string;
}

export const SHOTS = {
  main: {
    url: 'Pizzeria Roma, original build',
    src: '/images/pizzerias/roma-home.webp',
    w: 1600,
    h: 1000,
    alt: 'Pizzeria Roma home page: "Pizza, hot and fresh, order now" with the order phone number beside a pizza, above three promises: quality foods, fastest delivery and original recipes.',
  },
  mobile: {
    src: '/images/pizzerias/roma-mobile.webp',
    w: 780,
    h: 1688,
    alt: 'Pizzeria Roma menu on a phone: a category picker, a Margherita card with its price and an Order Now button, and a floating cart bar with three items.',
  },
  details: [
    {
      src: '/images/pizzerias/roma-menu.webp',
      w: 1600,
      h: 1000,
      alt: 'Pizzeria Roma menu: category tabs, pizza cards with prices and Order Now buttons, and the order panel with the cart, a voucher field and delivery options.',
      cap: 'Menu and order panel',
    },
    {
      src: '/images/pizzerias/roma-product.webp',
      w: 1600,
      h: 1000,
      alt: 'Product options for a Margherita: 26 or 32 cm, extra toppings and dips, each with its own price.',
      cap: 'Sizes and extras',
    },
    {
      src: '/images/pizzerias/roma-tracker.webp',
      w: 1600,
      h: 1000,
      alt: 'Order tracker: "Your food will be delivered in 20 to 30 min" above a chef illustration and "Our chefs are preparing your food".',
      cap: 'Order tracker',
    },
  ] as Shot[],
  homes: [
    {
      src: '/images/pizzerias/joker-home.webp',
      w: 1600,
      h: 1000,
      alt: 'Joker Pizza home page: a dark hero with "American style pan pizza", the order phone number and an Order Now button.',
      cap: 'Joker Pizza',
    },
    {
      src: '/images/pizzerias/turtles-home.webp',
      w: 1600,
      h: 1000,
      alt: 'Turtles Pizza home page: the same dark layout as Joker Pizza with its own logo and phone number.',
      cap: 'Turtles Pizza, the same layout',
    },
    {
      src: '/images/pizzerias/cloud-kitchen-menu.webp',
      w: 1600,
      h: 1000,
      alt: 'Cloud Kitchen menu on cream: a Beliebt tab with a pizza, a burger, a grill plate and French toast, each with Add to Cart, beside the order panel.',
      cap: 'Cloud Kitchen, the newest',
    },
  ] as Shot[],
};
