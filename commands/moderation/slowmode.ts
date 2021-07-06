import {BotClient} from '../../utils/BotClient';
import {Command, ExecuteEvent, PermissionLevel} from '../../utils/Command';
import ms from 'ms';
import {GuildChannel, MessageEmbed, TextChannel} from 'discord.js';

class slowmode extends Command {
  slowmodes: Map<string, TextChannel[]> = new Map();

  constructor(client: BotClient) {
    super(client, {
      name: 'slowmode',
      description: 'Sets how long people have to wait between messages',
      category: 'Moderation',
      aliases: ['ratelimit', 'sm', 'rl'],
      permissions: ['MANAGE_MESSAGES'],
      botPermissions: ['MANAGE_CHANNELS'],
      permissionLevel: PermissionLevel.Default,
      arguments: [
        {
          name: 'duration',
          description: 'The length of the slow mode',
          required: true,
          type: 'string'
        },
        {
          name: 'channel',
          description: 'The name of the channel to affect, or `-all` to affect all channels',
          required: false,
          type: 'string'
        }
      ]
    });
  }

  execute = async (event: ExecuteEvent) => {
    var duration: number = ['off', '0s', '0', 'disable'].includes(<string>event.arguments[0])
      ? 0
      : ms(<string>event.arguments[0]) / (!isNaN(Number(event.arguments[0])) ? 1 : 1000);
    var channel: string | null = <string | null>event.arguments[1];

    if (event.message.guild == null) return;
    var channels: TextChannel[] | null | undefined;

    if (duration > 21600000)
      return event.message.channel.send(new MessageEmbed().setTitle(' ').setColor('#ff0000').setDescription('The max slow mode duration is 6 hours!'));

    if (channel == null) channels = [<TextChannel>event.message.channel];
    else if (['-all', '--all', '-a'].includes(channel)) {
      channels = this.slowmodes.has(event.message.guild.id)
        ? this.slowmodes.get(event.message.guild.id)
        : <TextChannel[] | null>(
            event.message.guild.channels.cache.filter((c: GuildChannel) => c.type == 'text' && (<TextChannel>c).rateLimitPerUser == 0).array()
          );

      if (channels == null) return;
      if (duration == 0) this.slowmodes.delete(event.message.guild.id);
      else this.slowmodes.set(event.message.guild.id, channels);
    } else {
      channels = <TextChannel[] | null | undefined>(
        event.message.guild?.channels.cache.filter((c: GuildChannel) => c.type == 'text' && c.name.toLowerCase() == channel?.toLowerCase()).array()
      );
    }

    if (channels == null)
      return event.message.channel.send(new MessageEmbed().setTitle(' ').setColor('#ff0000').setDescription('Unknown channel! Did you spell the name right?'));

    channels.forEach((c: TextChannel) => c.setRateLimitPerUser(duration));

    event.message.channel.send(
      new MessageEmbed()
        .setTitle(' ')
        .setColor(event.embedColor)
        .setDescription(
          'Set **' +
            channels.length +
            '** channel' +
            (channels.length > 1 ? 's' : '') +
            "'" +
            (channels.length > 1 ? '' : 's') +
            ' slow mode to `' +
            ms(duration * 1000, { long: true }) +
            '`!'
        )
    );
  };
}

module.exports = (client: BotClient) => {
  return new slowmode(client);
};
