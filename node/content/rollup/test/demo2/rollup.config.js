// rollup.config.js
import json from 'rollup-plugin-json';
export default {
    input: './src/index.js',
    output: {
      file: 'bundle1.js',
      format: 'es',
      intro:'intro',
      outro:'outro',
      banner:'banner',
      footer:'footer'
    },
    plugins:[json()]
  };