import { Message, MessageEmbed } from 'discord.js';
import { BotClient } from '../../utils/BotClient';
import { Command, ExecuteEvent, PermissionLevel } from '../../utils/Command';

class coinflip extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'coinflip',
      description: 'Let the bot pick heads or tails',
      category: 'Fun',
      aliases: ['cf'],
      permissionLevel: PermissionLevel.Default,
      arguments: []
    });
  }

  execute = async (event: ExecuteEvent) => {
    var message: Message = await event.message?.channel?.send(
      new MessageEmbed().setTitle(' ').setColor(event.embedColor).setDescription(':coin: Flipping the coin...')
    );

    setTimeout(() => {
      message.edit(
        '',
        new MessageEmbed()
          .setTitle(' ')
          .setColor(event.embedColor)
          .setDescription(':coin: The outcome is **' + (Math.round(Math.random()) == 1 ? 'heads' : 'tails') + '**!')
      );
    }, 1500);
  };
}

module.exports = (client: BotClient) => {
  return new coinflip(client);
};
