const sharp = require('sharp');
const parse = require('csv-parse/lib/sync');
const Color = require('color');
var fs = require("fs");
var path = require("path");

function pretty_number(num) {
  if (num < 10) { return "000" + num }
  else if (num < 100) { return "00" + num }
  else if (num < 1000) { return "0" + num }
  else { return num }
}

var colors = [];
fs.readFile("scripts/input/SW Paint to RGB - Colors.csv", {encoding: 'utf-8'}, function (err, data) {
  if (err) throw err;

  colors = parse(data, {
    skip_empty_lines: true
  });

  colors.forEach(function (color) {
    number = color[0]
    sw_name = "SW" + pretty_number(number)
    color_name = color[1]

    sharp(null, { create: {
      width: 512,
      height: 512,
      channels: 3,
      background: Color({r: color[2], g: color[3], b: color[4]}),
    }}).toFile("scripts/output/" + sw_name + ".png");
  })
});
