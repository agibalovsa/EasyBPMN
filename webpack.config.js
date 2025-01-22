const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    bundle: [ './app/app.js' ]
  },
  output: {
    path: __dirname + '/public',
    filename: 'app.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          'css-loader',
        ]
      },
      {
        test: /\.bpmn$/i,
        use: 'raw-loader'
      },
      {
        test: /\.svg$/i,
        use: 'file-loader?name=./svg/[name].[ext]',
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'app/index.html', to: '.' }
      ]
    })
  ],
  mode: 'development',
  devtool: 'source-map'
};