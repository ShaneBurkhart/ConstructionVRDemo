const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: {
    finishes_app: "./react/finishes/index.js",
    renderer_uploader_app: "./react/renderer_uploader/index.js",
    finishes_app_revision: "./react/finishes_revision/index.js",
    projects_dashboard_app: "./react/projects_dashboard/index.js",
    document_viewer_app: "./react/document_viewer/index.js"
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
        test: /\.module\.css$/,
        use: ["style-loader", {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
            modules: {
              localIdentName: '[local]-[name]--[hash:base64:5]',
            },
          }
        }]
      },
      {
        test: /\.css$/,
        exclude: /\.module\.css/,
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
