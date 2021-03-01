const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: {
    finishes_app: "./react/finishes/index.js",
    admin_dashboard_app: "./react/admin_dashboard/index.js"
  },
  // entry: "./react/index.js",
  mode: "development",
  //watch: true,
  //watchOptions: {
    //aggregateTimeout: 3000,
    //poll: 5000,
  //},
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel-loader",
        options: { presets: ["@babel/env"] }
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 100000,
          },
        },
      },
    ]
  },
  resolve: { extensions: ["*", ".js", ".jsx"] },
  output: {
    path: path.resolve(__dirname, "public/dist"),
    publicPath: "/public/dist",
    filename: "[name].js"
  }
};
