
const finishAttributeMap = {
  0:{name: "Manufacturer", validate: () => {}},
  1:{name: "Product Number", validate: () => {}},
  2:{name: "Color", validate: () => {}},
  3:{name: "Style", validate: () => {}},
  4:{name: "Dimensions", validate: () => {}},
  5:{name: "Repeat", validate: () => {}},
  6:{name: "Grout Tag", validate: () => {}},
  7:{name: "Grout Joint Thickness", validate: () => {}},
  8:{name: "Installation Method", validate: () => {}},
  9:{name: "Carpet Pad", validate: () => {}},
  10:{name: "Finish", validate: () => {}},
  11:{name: "Type", validate: () => {}},
  12:{name: "Thickness", validate: () => {}},
  13:{name: "Edge Profile", validate: () => {}},
  14:{name: "Wood Species", validate: () => {}},
  15:{name: "Product URL", validate: () => {}},
  16:{name: "Price", validate: () => {}},
  17:{name: "Details", validate: () => {}},
  length: 18,
}

export const finishCategories = {
  paint: {
    name: "Paint",
    tag: "PT",
    attr: [0,1,2,15,16,17,] 
  },
  wallCovering: {
    name: "Wall Covering",
    tag: "WC",
    attr: [0,1,2,3,4,5,15,16,17,] 
  },
  tile: {
    name: "Tile",
    tag: "T",
    attr: [0,1,2,3,4,6,7,15,16,17,] 
  },
  grout: {
    name: "Grout",
    tag: "G",
    attr: [0,1,2,3,15,16,17,] 
  },
  carpet: {
    name: "Carpet",
    tag: "CPT",
    attr: [0,1,2,3,4,8,9,15,16,17,] 
  },
  luxuryVinylTile: {
    name: "Luxury Vinyl Tile",
    tag: "LVT",
    attr: [0,1,2,3,4,] 
  },
  sealedConcrete: {
    name: "Sealed Concrete",
    tag: "SC",
    attr: [0,1,2,10,15,16,17,] 
  },
  laminate: {
    name: "Laminate",
    tag: "L",
    attr: [0,1,2,3,10,15,16,17,] 
  },
  stoneCountertops: {
    name: "Stone Countertops",
    tag: "ST",
    attr: [0,2,10,11,12,13,15,16,17,] 
  },
  woodStain: {
    name: "Wood Stain",
    tag: "WS",
    attr: [2,10,14,15,16,17,] 
  },
  woodProducts: {
    name: "Wood Products",
    tag: "WP",
    attr: [0,1,2,3,4,11,14,15,16,17,] 
  },
  metalProducts: {
    name: "Metal Products",
    tag: "MP",
    attr: [0,1,2,3,10,15,16,17,] 
  },
  wallBase: {
    name: "Wall Base",
    tag: "B",
    attr: [0,1,3,4,11,15,16,17,] 
  },
  trim: {
    name: "Trim",
    tag: "TR",
    attr: [0,1,3,4,11,15,16,17,] 
  },
  transitionStrips: {
    name: "Transition Strips",
    tag: "TS",
    attr: [0,1,2,3,4,10,11,15,16,17,] 
  },
  doors: {
    name: "Doors",
    tag: "D",
    attr: [0,1,3,4,11,15,16,17,] 
  },
  doorHardware: {
    name: "Door Hardware",
    tag: "DH",
    attr: [0,2,3,15,16,17,] 
  },
  cabinets: {
    name: "Cabinets",
    tag: "CB",
    attr: [0,2,3,15,16,17,] 
  },
  cabinetHardware: {
    name: "Cabinet Hardware",
    tag: "CH",
    attr: [0,1,2,3,4,11,15,16,17,] 
  },
  mailboxes: {
    name: "Mailboxes",
    tag: "MB",
    attr: [0,1,2,3,4,] 
  },
  electrical: {
    name: "Electrical",
    tag: "E",
    attr: [0,1,2,3,15,16,17,] 
  },
  lightingFixtures: {
    name: "Lighting Fixtures",
    tag: "LT",
    attr: [0,1,2,3,4,15,16,17,] 
  },
  electronics: {
    name: "Electronics",
    tag: "EL",
    attr: [0,1,2,3,4,11,15,16,17,] 
  },
  plumbing: {
    name: "Plumbing",
    tag: "PL",
    attr: [0,1,2,3,4,10,11,15,16,17,] 
  },
  restroomAccessories: {
    name: "Restroom Accessories",
    tag: "RA",
    attr: [0,1,2,3,4,10,11,15,16,17,] 
  },
  appliances: {
    name: "Appliances",
    tag: "AP",
    attr: [0,1,2,3,4,11,15,16,17,] 
  },
  fabric: {
    name: "Fabric",
    tag: "FA",
    attr: [0,1,2,3,4,5,11,15,16,17,] 
  },
  furniture: {
    name: "Furniture",
    tag: "F",
    attr: [0,1,2,3,4,11,15,16,17,] 
  },
  wallDecor: {
    name: "Wall Decor",
    tag: "WD",
    attr: [0,1,2,3,4,11,15,16,17,] 
  },
  miscDecor: {
    name: "Misc Decor",
    tag: "MD",
    attr: [0,1,2,3,4,11,15,16,17,] 
  },
  windowTreatments: {
    name: "Window Treatments",
    tag: "WT",
    attr: [0,1,2,3,4,11,15,16,17,] 
  },
  misc: {
    name: "Miscellaneous",
    tag: "M",
    attr: [0,1,2,3,4,15,16,17,] 
  },
 }

 const attrArr = Array.from(finishAttributeMap)

 export const getAttrList = category => category.attr.map(a => attrArr[a]);
