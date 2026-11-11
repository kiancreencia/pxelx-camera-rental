// Demo catalog shown when Supabase env vars are not set, so the site runs
// right after `npm install`. Mirrors supabase/seed.sql. Booking is disabled in demo mode.
import type { Camera, Category } from "./types";

export const demoCategories: Category[] = [
  { slug: "compact", name: "Compact cameras" },
  { slug: "mirrorless", name: "Mirrorless" },
  { slug: "action", name: "Action and gimbal" },
  { slug: "lenses", name: "Lenses" },
];

const c = (slug: string) => demoCategories.find((x) => x.slug === slug)!;

export const demoCameras: Camera[] = [
  {
    id: "canon-g7x-mark-iii",
    slug: "canon-g7x-mark-iii",
    name: "Canon G7 X Mark III",
    brand: "Canon",
    tagline: "Pocketable vlogging camera with a flip-up screen.",
    description:
      "A compact camera with a fast f/1.8-2.8 lens, a screen that flips up for self-shots, and live streaming over USB. Easy to carry on trips and simple enough for a first vlog.",
    dailyRate: 500,
    deposit: 5000,
    quantity: 2,
    includes: ["Battery x2", "64GB SD card", "Charger", "Wrist strap", "Carry pouch"],
    imageUrl: null,
    categorySlug: c("compact").slug,
    categoryName: c("compact").name,
  },
  {
    id: "sony-zv-1",
    slug: "sony-zv-1",
    name: "Sony ZV-1",
    brand: "Sony",
    tagline: "Vlog-first compact with strong autofocus.",
    description:
      "One-inch sensor, a built-in ND filter, and a directional mic with a wind screen. Good for talking-head videos and travel clips.",
    dailyRate: 550,
    deposit: 6000,
    quantity: 1,
    includes: ["Battery x2", "64GB SD card", "Charger", "Wind screen", "Carry pouch"],
    imageUrl: null,
    categorySlug: c("compact").slug,
    categoryName: c("compact").name,
  },
  {
    id: "canon-eos-r50",
    slug: "canon-eos-r50",
    name: "Canon EOS R50",
    brand: "Canon",
    tagline: "Light APS-C mirrorless with 4K video.",
    description:
      "Subject-tracking autofocus, 4K video, and RF-mount lenses. Comes with the 18-45mm kit lens.",
    dailyRate: 750,
    deposit: 8000,
    quantity: 2,
    includes: ["18-45mm kit lens", "Battery x2", "64GB SD card", "Charger", "Camera strap"],
    imageUrl: null,
    categorySlug: c("mirrorless").slug,
    categoryName: c("mirrorless").name,
  },
  {
    id: "fujifilm-x-t30-ii",
    slug: "fujifilm-x-t30-ii",
    name: "Fujifilm X-T30 II",
    brand: "Fujifilm",
    tagline: "Film-style color straight out of the camera.",
    description:
      "A small APS-C body with Fujifilm color profiles, so photos look finished without editing. Comes with the 15-45mm kit lens.",
    dailyRate: 850,
    deposit: 10000,
    quantity: 1,
    includes: ["15-45mm kit lens", "Battery x2", "64GB SD card", "Charger", "Camera strap"],
    imageUrl: null,
    categorySlug: c("mirrorless").slug,
    categoryName: c("mirrorless").name,
  },
  {
    id: "dji-osmo-pocket-3",
    slug: "dji-osmo-pocket-3",
    name: "DJI Osmo Pocket 3",
    brand: "DJI",
    tagline: "Pocket gimbal camera for smooth handheld video.",
    description:
      "A three-axis gimbal with a one-inch sensor and a rotating touchscreen. Walk, run, or ride and the footage stays steady.",
    dailyRate: 400,
    deposit: 5000,
    quantity: 3,
    includes: ["Battery", "64GB microSD card", "Charging cable", "Wrist strap", "Carry bag"],
    imageUrl: null,
    categorySlug: c("action").slug,
    categoryName: c("action").name,
  },
  {
    id: "gopro-hero-13-black",
    slug: "gopro-hero-13-black",
    name: "GoPro HERO13 Black",
    brand: "GoPro",
    tagline: "Waterproof action camera for trips and sports.",
    description:
      "Waterproof to 10 m without a case, with 5.3K video and HyperSmooth stabilization. Includes a few mounts for helmets and handlebars.",
    dailyRate: 450,
    deposit: 5000,
    quantity: 3,
    includes: ["Enduro battery x2", "64GB microSD card", "Charging cable", "Mounting kit"],
    imageUrl: null,
    categorySlug: c("action").slug,
    categoryName: c("action").name,
  },
  {
    id: "sigma-30mm-f1-4-rf",
    slug: "sigma-30mm-f1-4-rf",
    name: "Sigma 30mm f/1.4 (RF mount)",
    brand: "Sigma",
    tagline: "Fast prime for portraits and low light.",
    description:
      "A bright 30mm lens with a soft blurred background. Fits Canon RF-mount APS-C bodies such as the EOS R50.",
    dailyRate: 300,
    deposit: 6000,
    quantity: 1,
    includes: ["Front and rear caps", "Lens hood", "Pouch"],
    imageUrl: null,
    categorySlug: c("lenses").slug,
    categoryName: c("lenses").name,
  },
];
