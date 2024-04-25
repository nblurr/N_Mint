const path = require('path');
const webpack = require('webpack');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");


module.exports = {
  experiments: {
    outputModule: true, // Enable the experimental output module feature
  },
  entry: './NMint.mjs', // Your main JS file
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'NMint.bundle.mjs',
    publicPath: '/dist/',  // Explicitly set the public path
    library: {
        type: 'module'  // This is crucial for ES Module support
    }
  },
  
  // other config settings
  resolve: {
    fallback: {
      "worker_threads": false, // Fallback to false if no browser-compatible package is possible
      "fs": false,
      "stream-web": false,
      "stream/web": false,
      "buffer": require.resolve("buffer/"), // Provide a path to the buffer polyfill
      "process": require.resolve("process/browser"),
      "stream": require.resolve("stream-browserify"),
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "zlib": require.resolve("browserify-zlib")
    },
  },
  
  plugins: [
	new NodePolyfillPlugin(),
    new webpack.ProvidePlugin({
	  net: ['net', 'Net'],
	  fs: ['fs', 'Fs'],
      Buffer: ['buffer', 'Buffer'],
      process:  ['process', 'Process'],
      'stream-browserify':  ['stream-browserify', 'Stream-browserify'],
      'stream-http':  ['stream-http', 'Stream-http'],
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_DEBUG': 'false',
    }),
    new webpack.NormalModuleReplacementPlugin(/node:/, (resource) => {
      const mod = resource.request.replace(/^node:/, '');
      switch (mod) {
        case 'net':
          resource.request = 'net';
          break;
        case 'util':
          resource.request = 'util';
          break;
        case 'path':
          resource.request = 'path';
          break;
        case 'http':
          resource.request = 'stream-http';
          break;
        case 'https':
          resource.request = 'https-browserify';
          break;
        case 'zlib':
          resource.request = 'browserify-zlib';
          break;
        case 'url':
          resource.request = 'url';
          break;
        case 'fs':
          resource.request = 'fs';
          break;
        case 'buffer':
          resource.request = 'buffer';
          break;
        case 'stream':
          resource.request = 'readable-stream';
          break;
        case 'process':
          resource.request = 'process';
          break;
        case 'stream-web':
          resource.request = 'stream-web';
          break;
        case 'stream/web':
          resource.request = 'stream/web';
          break;
        default:
          throw new Error(`Not found ${mod}`);
      }
    })
  ],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};
