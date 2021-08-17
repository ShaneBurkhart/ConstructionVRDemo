// Go to their listings page, load all of the products you want to scrape.  Run the script in the console.
//
var parser = new DOMParser();
var labels = document.getElementsByClassName("card__name");
var sum = "";
var copy_ref = copy;

function getElementByXpath(path, doc) {
  return document.evaluate(path, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function scrapeURL(index) {
  if (index >= labels.length) {
    console.log(sum);
    copy_ref(sum);
    return;
  }

  console.log(index);

  var name = labels[index].textContent.trim();
  var url = labels[index].href;

  fetch(url).then(function (res) {
    res.text().then(function (text) {
      var doc = parser.parseFromString(text, "text/html");
      console.log(doc);
      var manufacturer = "Armstrong";
      var type = "LVT - Luxury Vinyl Tile";

      var model_num = getElementByXpath("//table[contains(@class, \"item-differentiators\")]/tbody[1]/tr[1]/td[1]", doc).textContent.trim();
      var description = [
        "Collection: " + getElementByXpath("//table[contains(@class, \"item-differentiators\")]/tbody[1]/tr[2]/td[1]", doc).textContent.trim(),
        "Design: " + getElementByXpath("//table[contains(@class, \"item-differentiators\")]/tbody[1]/tr[5]/td[1]", doc).textContent.trim(),
        "Color: " + getElementByXpath("//table[contains(@class, \"item-differentiators\")]/tbody[1]/tr[3]/td[1]", doc).textContent.trim(),
        "Size: " + getElementByXpath("//table[contains(@class, \"item-differentiators\")]/tbody[1]/tr[4]/td[1]", doc).textContent.trim().split("\n")[0].trim(),
      ].join("|");

      sum += [name, type, url, manufacturer, model_num, description].join("\t") + "\n";

      scrapeURL(index + 1);
    });
  });
}

scrapeURL(0);
