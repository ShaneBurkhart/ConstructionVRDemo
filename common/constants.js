
const finishAttributeMap = {
  0:{name: "Manufacturer", order: 10, validate: () => {}},
  1:{name: "Product Number", order: 10, validate: () => {}},
  2:{name: "Color", order: 10, validate: () => {}},
  3:{name: "Style", order: 10, validate: () => {}},
  4:{name: "Dimensions", order: 10, validate: () => {}},
  5:{name: "Repeat", order: 10, validate: () => {}},
  6:{name: "Grout Tag", order: 10, validate: () => {}},
  7:{name: "Grout Joint Thickness", order: 10, validate: () => {}},
  8:{name: "Installation Method", order: 10, validate: () => {}},
  9:{name: "Carpet Pad", order: 10, validate: () => {}},
  10:{name: "Finish", order: 10, validate: () => {}},
  11:{name: "Type", order: 10, validate: () => {}},
  12:{name: "Thickness", order: 10, validate: () => {}},
  13:{name: "Edge Profile", order: 10, validate: () => {}},
  14:{name: "Wood Species", order: 10, validate: () => {}},
  15:{name: "Product URL", order: 3, validate: () => {}},
  16:{name: "Price", order: 2, validate: () => {}},
  17:{name: "Details", order: 18, validate: () => {}},
  18:{name: "Images", order: 0, validate: () => {}},
  19:{name: "Name", order: 1, validate: () => {}},
  length: 20,
}

export const finishCategories = {
  "Paint": {
    name: "Paint",
    tag: "PT",
    attr: [0,1,2,15,16,17,18,19] 
  },
  "Wall Covering": {
    name: "Wall Covering",
    tag: "WC",
    attr: [0,1,2,3,4,5,15,16,17,18,19] 
  },
  "Tile": {
    name: "Tile",
    tag: "T",
    attr: [0,1,2,3,4,6,7,15,16,17,18,19] 
  },
  "Grout": {
    name: "Grout",
    tag: "G",
    attr: [0,1,2,3,15,16,17,18,19] 
  },
  "Carpet": {
    name: "Carpet",
    tag: "CPT",
    attr: [0,1,2,3,4,8,9,15,16,17,18,19] 
  },
  "Luxury Vinyl Tile": {
    name: "Luxury Vinyl Tile",
    tag: "LVT",
    attr: [0,1,2,3,4,15,16,17,18,19] 
  },
  "Sealed Concrete": {
    name: "Sealed Concrete",
    tag: "SC",
    attr: [0,1,2,10,15,16,17,18,19] 
  },
  "Laminate": {
    name: "Laminate",
    tag: "L",
    attr: [0,1,2,3,10,15,16,17,18,19] 
  },
  "Stone Countertops": {
    name: "Stone Countertops",
    tag: "ST",
    attr: [0,2,10,11,12,13,15,16,17,18,19] 
  },
  "Wood Stain": {
    name: "Wood Stain",
    tag: "WS",
    attr: [2,10,14,15,16,17,18,19] 
  },
  "Wood Products": {
    name: "Wood Products",
    tag: "WP",
    attr: [0,1,2,3,4,11,14,15,16,17,18,19] 
  },
  "Metal Products": {
    name: "Metal Products",
    tag: "MP",
    attr: [0,1,2,3,10,15,16,17,18,19] 
  },
  "Wall Base": {
    name: "Wall Base",
    tag: "B",
    attr: [0,1,3,4,11,15,16,17,18,19] 
  },
  "Trim": {
    name: "Trim",
    tag: "TR",
    attr: [0,1,3,4,11,15,16,17,18,19] 
  },
  "Transition Strips": {
    name: "Transition Strips",
    tag: "TS",
    attr: [0,1,2,3,4,10,11,15,16,17,18,19] 
  },
  "Doors": {
    name: "Doors",
    tag: "D",
    attr: [0,1,3,4,11,15,16,17,18,19] 
  },
  "Door Hardware": {
    name: "Door Hardware",
    tag: "DH",
    attr: [0,2,3,15,16,17,18,19] 
  },
  "Cabinets": {
    name: "Cabinets",
    tag: "CB",
    attr: [0,2,3,15,16,17,18,19] 
  },
  "Cabinet Hardware": {
    name: "Cabinet Hardware",
    tag: "CH",
    attr: [0,1,2,3,4,11,15,16,17,18,19] 
  },
  "Mailboxes": {
    name: "Mailboxes",
    tag: "MB",
    attr: [0,1,2,3,4,17,18,19] 
  },
  "Electrical": {
    name: "Electrical",
    tag: "E",
    attr: [0,1,2,3,15,16,17,18,19] 
  },
  "Lighting Fixtures": {
    name: "Lighting Fixtures",
    tag: "LT",
    attr: [0,1,2,3,4,15,16,17,18,19] 
  },
  "Electronics": {
    name: "Electronics",
    tag: "EL",
    attr: [0,1,2,3,4,11,15,16,17,18,19] 
  },
  "Plumbing": {
    name: "Plumbing",
    tag: "PL",
    attr: [0,1,2,3,4,10,11,15,16,17,18,19] 
  },
  "Restroom Accessories": {
    name: "Restroom Accessories",
    tag: "RA",
    attr: [0,1,2,3,4,10,11,15,16,17,18,19] 
  },
  "Appliances": {
    name: "Appliances",
    tag: "AP",
    attr: [0,1,2,3,4,11,15,16,17,18,19] 
  },
  "Fabric": {
    name: "Fabric",
    tag: "FA",
    attr: [0,1,2,3,4,5,11,15,16,17,18,19] 
  },
  "Furniture": {
    name: "Furniture",
    tag: "F",
    attr: [0,1,2,3,4,11,15,16,17,18,19] 
  },
  "Wall Decor": {
    name: "Wall Decor",
    tag: "WD",
    attr: [0,1,2,3,4,11,15,16,17,18,19] 
  },
  "Misc Decor": {
    name: "Misc Decor",
    tag: "MD",
    attr: [0,1,2,3,4,11,15,16,17,18,19] 
  },
  "Window Treatments": {
    name: "Window Treatments",
    tag: "WT",
    attr: [0,1,2,3,4,11,15,16,17,18,19] 
  },
  "Miscellaneous": {
    name: "Miscellaneous",
    tag: "M",
    attr: [0,1,2,3,4,15,16,17,18,19] 
  },
 }

 const attrArr = Array.from(finishAttributeMap);

 export const allCategoriesArr = Object.keys(finishCategories).map(c => finishCategories[c].name);

 export const getAttrList = category => category.attr.map(a => attrArr[a]).sort((a,b) => a.order - b.order);
