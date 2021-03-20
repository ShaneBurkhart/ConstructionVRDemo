const finishAttributes = [
  {name: "Manufacturer", width: 5, validate: () => {}},
  {name: "Product Number", width: 5, validate: () => {}},
  {name: "Color", width: 5, validate: () => {}},
  {name: "Style", width: 5, validate: () => {}},
  {name: "Dimensions", width: 5, validate: () => {}},
  {name: "Repeat", width: 5, validate: () => {}},
  {name: "Grout Tag", width: 5, validate: () => {}},
  {name: "Grout Joint Thickness", width: 5, validate: () => {}},
  {name: "Installation Method", width: 5, validate: () => {}},
  {name: "Carpet Pad", width: 5, validate: () => {}},
  {name: "Finish", width: 5, validate: () => {}},
  {name: "Type", width: 5, validate: () => {}},
  {name: "Thickness", width: 5, validate: () => {}},
  {name: "Edge Profile", width: 5, validate: () => {}},
  {name: "Wood Species", width: 5, validate: () => {}},
  {name: "Product URL", width: 8, validate: () => {}},
  {name: "Price", width: 5, validate: () => {}},
  {name: "Details", width: 16, validate: () => {}},
  {name: "Images", width: 16, validate: () => {}},
  {name: "Name", width: 8, validate: () => {}},
];

export const finishCategories = {
  "Paint": {
    tag: "PT",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Price","Details","Images",], 
  },
  "Wall Covering": {
    tag: "WC",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Dimensions","Repeat","Price","Details","Images",], 
  },
  "Tile": {
    tag: "T",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Dimensions","Grout Tag","Grout Joint Thickness","Price","Details","Images",], 
  },
  "Grout": {
    tag: "G",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Price","Details","Images",], 
  },
  "Carpet": {
    tag: "CPT",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Dimensions","Installation Method","Carpet Pad","Price","Details","Images",], 
  },
  "Luxury Vinyl Tile": {
    tag: "LVT",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Dimensions","Price","Details","Images",], 
  },
  "Sealed Concrete": {
    tag: "SC",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Finish","Price","Details","Images",], 
  },
  "Laminate": {
    tag: "L",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Finish","Price","Details","Images",], 
  },
  "Stone Countertops": {
    tag: "ST",
    attr: ["Name","Product URL","Manufacturer","Color","Finish","Type","Thickness","Edge Profile","Price","Details","Images",], 
  },
  "Wood Stain": {
    tag: "WS",
    attr: ["Name","Product URL","Color","Finish","Wood Species","Price","Details","Images",], 
  },
  "Wood Products": {
    tag: "WP",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Dimensions","Type","Wood Species","Price","Details","Images",], 
  },
  "Metal Products": {
    tag: "MP",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Finish","Price","Details","Images",], 
  },
  "Wall Base": {
    tag: "B",
    attr: ["Name","Product URL","Manufacturer","Product Number","Style","Dimensions","Type","Price","Details","Images",], 
  },
  "Trim": {
    tag: "TR",
    attr: ["Name","Product URL","Manufacturer","Product Number","Style","Dimensions","Type","Price","Details","Images",], 
  },
  "Transition Strips": {
    tag: "TS",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Dimensions","Finish","Type","Price","Details","Images",], 
  },
  "Doors": {
    tag: "D",
    attr: ["Name","Product URL","Manufacturer","Product Number","Style","Dimensions","Type","Price","Details","Images",], 
  },
  "Door Hardware": {
    tag: "DH",
    attr: ["Name","Product URL","Manufacturer","Color","Style","Price","Details","Images",], 
  },
  "Cabinets": {
    tag: "CB",
    attr: ["Name","Product URL","Manufacturer","Color","Style","Price","Details","Images",], 
  },
  "Cabinet Hardware": {
    tag: "CH",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Dimensions","Type","Price","Details","Images",], 
  },
  "Mailboxes": {
    tag: "MB",
    attr: ["Name","Manufacturer","Product Number","Color","Style","Dimensions","Details","Images",], 
  },
  "Electrical": {
    tag: "E",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Price","Details","Images",], 
  },
  "Lighting Fixtures": {
    tag: "LT",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Dimensions","Price","Details","Images",], 
  },
  "Electronics": {
    tag: "EL",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Dimensions","Type","Price","Details","Images",], 
  },
  "Plumbing": {
    tag: "PL",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Dimensions","Finish","Type","Price","Details","Images",], 
  },
  "Restroom Accessories": {
    tag: "RA",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Dimensions","Finish","Type","Price","Details","Images",], 
  },
  "Appliances": {
    tag: "AP",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Dimensions","Type","Price","Details","Images",], 
  },
  "Fabric": {
    tag: "FA",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Dimensions","Repeat","Type","Price","Details","Images",], 
  },
  "Furniture": {
    tag: "F",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Dimensions","Type","Price","Details","Images",], 
  },
  "Wall Decor": {
    tag: "WD",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Dimensions","Type","Price","Details","Images",], 
  },
  "Misc Decor": {
    tag: "MD",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Dimensions","Type","Price","Details","Images",], 
  },
  "Window Treatments": {
    tag: "WT",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Dimensions","Type","Price","Details","Images",], 
  },
  "Miscellaneous": {
    tag: "M",
    attr: ["Name","Product URL","Manufacturer","Product Number","Color","Style","Dimensions","Price","Details","Images",], 
  },
 }

 export const allCategoryNames = Object.keys(finishCategories);

 export const getCategoryTag = category => finishCategories[category].tag;

 export const getAttrList = category => category.attr.map(attribute => finishAttributes.find(({name}) => name === attribute));

 export const getAttrGridRows = (attrList=[]) => {
  let remainingWidth = 16;
  const attrRows = [];
  let row = [];

  for (let i = 0; i < attrList.length; i++){
    row.push(attrList[i])
    remainingWidth = remainingWidth - attrList[i].width;
    if (!attrList[i+1]) {
      attrRows.push(row);
    } else if (attrList[i+1].width > remainingWidth) {
      attrRows.push(row);
      remainingWidth = 16;
      row = [];
    }
  }
  return attrRows;
}