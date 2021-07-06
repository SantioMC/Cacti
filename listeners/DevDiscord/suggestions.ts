import { BotClient } from '../../utils/BotClient';
import { Listener } from '../../utils/Listener';
import { Message } from 'discord.js';

export class verification extends Listener {
  constructor(client: BotClient) {
    super(client, {
      name: 'Suggestions',
      guild: '827311645427499059'
    });

    client.on('message', async (message: Message) => {
      if (message.channel.id != '860709816212521022' || message.author.bot) return;
      await message.react('<a:yes:861356583119618068>');
      await message.react('<a:no:861357047080550421>');
    });
  }
}

module.exports = (client: BotClient) => {
  return new verification(client);
};
