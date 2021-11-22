// rollup.config.js
import json from 'rollup-plugin-json';
import vue from 'rollup-plugin-vue'
export default {
    input: './src/index.js',
    output: {
      file: 'bundle1.js',
      format: 'umd',
      name: "experience",
      // intro:'intro',
      // outro:'outro',
      // banner:'banner',
      // footer:'footer'
    },
    plugins:[json(),vue()],
    external: ["the-answer"],
  };