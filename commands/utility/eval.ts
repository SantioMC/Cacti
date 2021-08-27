import { BotClient } from '../../utils/BotClient';
import { Command, ExecuteEvent, PermissionLevel } from '../../utils/Command';
import { MessageEmbed } from 'discord.js';
const fetch = require('node-fetch');

class exec extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'exec',
      description: 'Evaluate Code',
      category: 'Utility',
      aliases: ['eval'],
      permissionLevel: PermissionLevel.Default,
      arguments: [
        {
          name: 'code',
          description: 'The code to execute',
          required: true,
          type: 'string'
        }
      ]
    });
  }

  execute = async (event: ExecuteEvent) => {
    if (event.client.token == null) return;
    var code = event.message.content.substring(event.message.content.split(' ')[0].length + 1);

    var embed: MessageEmbed = new MessageEmbed()
      .setTitle(' ')
      .setColor(event.embedColor)
      .setFooter('Evaluation by ' + event.message.author.tag);

    var result: string = '';
    var message = await event.message.channel.send(embed.setDescription(':stopwatch: Evaluating...'));

    if (code.startsWith('-f ') && event.message.author.id == '239752804468654090') {
      code = code.substring(3);
      try {
        result = `${eval(code)}`;
        if (result.includes(event.client.token)) result = '// Output was automatically redacted';
      } catch (e) {
        result = `${e}`;
      }
    } else {
      var runtimes = await (await fetch('https://emkc.org/api/v2/piston/runtimes')).json();
      var version = runtimes.filter((r: any) => r.runtime == 'node')[0].version;

      var output = await (
        await fetch('https://emkc.org/api/v2/piston/execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            language: 'javascript',
            version: version,
            files: [
              {
                content: code
              }
            ],
            stdin: '',
            args: ['1', '2', '3'],
            compile_timeout: 10000,
            run_timeout: 3000,
            compile_memory_limit: -1,
            run_memory_limit: -1
          })
        })
      ).json();

      result = output.run.output;
    }

    if (result.length > 1975) result = '// Result is too long to show!';
    if (`${result}`.trim() == '') result = '// No output was recorded, try using console.log()';

    var executedField = '```js\n' + code.replace(/`/, '\\`') + '\n```';
    var outputField = '```js\n' + result.replace(/`/, '\\`') + '\n```';
    message.edit(' ', embed.setDescription(`Code Executed:\n${executedField}\nOutput:\n${outputField}`));
  };
}

module.exports = (client: BotClient) => {
  return new exec(client);
};
