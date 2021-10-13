const prompts = require('prompts');

const questions = [
  {
    type: 'number',
    message: 'This message will be overridden',
    onRender(kleur) {
      this.msg = kleur.cyan('Enter a number');
    }
  },
  {
    type: 'text',
    name: 'dish',
    message: 'Do you like pizza?'
  },
  {
    type: prev => prev == 'pizza' ? 'text' : null,
    name: 'topping',
    message: 'Name a topping'
  }
];
const onSubmit = (prompt, answer,answers) => console.log(`Thanks I got ${answer} from ${prompt.name}`,answers);

(async () => {
  const response = await prompts(questions,{onSubmit});
})();