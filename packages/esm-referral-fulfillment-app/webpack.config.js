const path = require('path');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const pkg = require('./package.json');

const moduleName = pkg.name;
// strip the npm scope so terser/swc don't mistake "@openmrs/..." for a decorator at column 0
const filename = `${moduleName.replace(/^@/, '').replace('/', '-')}.js`;
// Global variable name the OpenMRS app shell reads after loading the bundle.
// Must match the convention `_<scope>_<name>` (single leading underscore).
// Official ESMs (e.g. _openmrs_esm_patient_conditions_app) use this exact shape.
const globalName = moduleName.replace(/[^a-zA-Z0-9]/g, '_');

module.exports = (env = {}) => ({
  // Module Federation supplies the entry via `exposes`; no top-level entry needed.
  entry: {},
  output: {
    chunkFilename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: 'auto',
    uniqueName: pkg.name,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  optimization: { minimize: false },
  module: {
    rules: [
      {
        test: /\.(jsx?|tsx?)$/,
        exclude: /node_modules/,
        use: {
          loader: 'swc-loader',
          options: {
            jsc: {
              parser: { syntax: 'typescript', tsx: true, decorators: false },
              transform: { react: { runtime: 'automatic' } },
              target: 'es2020',
            },
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new ModuleFederationPlugin({
      // Use a JS-identifier-safe name; appears as the global var.
      name: globalName,
      filename: filename,
      // Plain `var` library: app shell loads the script and reads window[globalName].
      // Same shape as official OpenMRS ESMs (e.g. esm-patient-conditions-app).
      library: { type: 'var', name: globalName },
      exposes: { './start': './src/index' },
      shared: {
        '@openmrs/esm-framework': { singleton: true, eager: false, requiredVersion: false, import: false },
        react: { singleton: true, eager: false, requiredVersion: false, import: false },
        'react-dom': { singleton: true, eager: false, requiredVersion: false, import: false },
        'react-i18next': { singleton: true, eager: false, requiredVersion: false, import: false },
        rxjs: { singleton: true, eager: false, requiredVersion: false, import: false },
      },
    }),
  ],
});
