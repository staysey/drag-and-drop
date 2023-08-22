const path = require('path') //core nodejs module

const CleanPlugin = require('clean-webpack-plugin')

module.exports = {
  mode: 'production',
  entry: './src/app.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    //how to work with files -> apply to all
    rules: [
      {
        test: /\.ts$/, //check ts files
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    //which extensions to add
    extensions: ['.ts', '.js']
  },
  devServer: {
    static: [
      {
        directory: path.join(__dirname)
      }
    ]
  },
  plugins: [
    //applies to general workflow
    new CleanPlugin.CleanWebpackPlugin()
    //whenever we rebuild project -> clean up dist folder
  ]
}
