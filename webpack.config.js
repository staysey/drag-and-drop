const path = require('path') //core nodejs module

module.exports = {
  mode: 'development',
  entry: './src/app.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/' //where the output is written to
  },
  devtool: 'inline-source-map',
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
  }
}
