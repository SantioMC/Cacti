import {BotClient} from '../../utils/BotClient';
import {Command, ExecuteEvent, PermissionLevel} from '../../utils/Command';
import {GuildChannel, MessageEmbed, TextChannel} from 'discord.js';

class announce extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'announce',
      description: 'Send an embed to a certain channel',
      category: 'Utility',
      aliases: ['broadcast', 'bc'],
      permissionLevel: PermissionLevel.Default,
      arguments: [
        {
          name: 'channel',
          description: 'The name of the channel to announce in',
          required: true,
          type: 'string'
        },
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

    var channel: TextChannel | null = <TextChannel | null>(
      event.message.guild.channels.cache
        .filter((c: GuildChannel) => c.type != 'voice' && c.type != 'category' && c.name.toLowerCase() == <string>event.arguments[0])
        .first()
    );
    if (channel == null)
      return event.message.channel.send(
        new MessageEmbed().setTitle(' ').setColor(event.embedColor).setDescription('Unknown channel! Did you spell the name right?')
      );

    var content: string = event.message.content.substring(event.client.data.prefix.length + event.command.length + (<string>event.arguments[0]).length + 2);

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
