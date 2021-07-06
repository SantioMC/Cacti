import { BotClient } from '../../utils/BotClient';
import { Command, ExecuteEvent, PermissionLevel } from '../../utils/Command';
import { GuildChannel, MessageEmbed, TextChannel } from 'discord.js';

class announce extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'announce',
      description: 'Send an embed to a certain channel',
      category: 'Utility',
      aliases: ['broadcast', 'bc'],
      permissions: ['MANAGE_MESSAGES'],
      permissionLevel: PermissionLevel.Default,
      arguments: [
        {
          name: 'content',
          description: 'The message to send',
          required: true,
          type: 'string'
        }
      ]
    });
  }

  execute = async (event: ExecuteEvent) => {
    if (event.message.guild == null) return;

    var channel: TextChannel = <TextChannel>event.message.channel;
    await event.message.delete();

    var content: string = event.message.content.substring(event.client.data.prefix.length + event.command.length + 1);

    channel.send(
      new MessageEmbed()
        .setTitle(' ')
        .setColor(event.embedColor)
        .setDescription(content)
        .setFooter('Message by ' + event.message.author.tag)
    );
  };
}

module.exports = (client: BotClient) => {
  return new announce(client);
};
