import { BotClient } from '../../utils/BotClient';
import { Command, ExecuteEvent, PermissionLevel } from '../../utils/Command';
import { GuildMember, Message, MessageEmbed } from 'discord.js';

class hack extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'hack',
      description: 'Hack a user (totally real!!111!)',
      category: 'Fun',
      aliases: [],
      permissionLevel: PermissionLevel.Default,
      arguments: [
        {
          name: 'user',
          description: 'The user you want to "hack"',
          required: true,
          type: 'member'
        }
      ]
    });
  }

  execute = async (event: ExecuteEvent) => {
    var user: GuildMember = <GuildMember>event.arguments.shift();
    var messages: string[] = [
      'Getting IPv4...',
      'IP Found: 420.69.420.69:1337',
      'Stealing cookies... :cookie:',
      'No cookies found :(',
      "\n*This wasn't a real hack, don't worry! :)*"
    ];

    var embed: MessageEmbed = new MessageEmbed()
      .setTitle(' ')
      .setColor(event.embedColor)
      .setDescription('Hacking <@' + user.id + '>');
    var message: Message = await event.message.channel.send(embed);

    var index: number = 0;
    var interval: NodeJS.Timeout = setInterval(() => {
      if (messages.length == index) return clearInterval(interval);
      embed.setDescription((embed.description += '\n' + messages[index]));
      message.edit(' ', embed);
      index++;
    }, 2000);
  };
}

module.exports = (client: BotClient) => {
  return new hack(client);
};
