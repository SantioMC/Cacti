import { BotClient } from '../../utils/BotClient';
import { Command, ExecuteEvent, PermissionLevel } from '../../utils/Command';
import ms from 'ms';
import { GuildChannel, Message, MessageEmbed, PermissionOverwriteOption, Role, TextChannel } from 'discord.js';

class lockdown extends Command {
  lockeddown: Map<string, TextChannel[]> = new Map();

  constructor(client: BotClient) {
    super(client, {
      name: 'lockdown',
      description: 'Stops people from sending messages until lockdown is lifted',
      category: 'Moderation',
      permissions: ['MANAGE_CHANNELS'],
      botPermissions: ['MANAGE_CHANNELS'],
      permissionLevel: PermissionLevel.Default,
      arguments: [
        {
          name: 'channels',
          description: 'The channels to lock down seperated with a space, or `-all` if a configuration is setup',
          required: true,
          type: 'string'
        },
        {
          name: 'reason',
          description: 'The reason why the server is in lockdown',
          required: false,
          type: 'string'
        }
      ]
    });
  }

  execute = async (event: ExecuteEvent) => {
    if (event.message.guild == null) return;

    if (this.lockeddown.has(event.message.guild.id)) {
      var role: Role = event.message.guild.roles.everyone;

      if (role == null)
        return event.message.channel.send(new MessageEmbed().setTitle(' ').setColor('#ff0000').setDescription('Unable to find the default role!'));

      var channels: TextChannel[] | undefined = this.lockeddown.get(event.message.guild.id);
      if (channels == undefined) return;

      channels.forEach((c: TextChannel) => {
        var embed: MessageEmbed = new MessageEmbed().setTitle(' ').setColor(event.embedColor).setDescription('The discord server is no longer on lockdown!');
        var lastMsg: Message | null = c.lastMessage;

        if (lastMsg != null && lastMsg.author.id == event.client.user?.id) lastMsg.edit(embed);
        else c.send(embed);

        c.updateOverwrite(<Role>role, {
          SEND_MESSAGES: null
        });
      });

      return event.message.channel.send(
        new MessageEmbed()
          .setTitle(' ')
          .setColor(event.embedColor)
          .setDescription('Successfully unlocked **' + channels.length + '** channel' + (channels.length > 1 ? 's' : '') + '!')
      );
    }

    var channels: TextChannel[] | undefined = [];
    if (['-all', '--all', '-a'].includes(<string>event.arguments[0])) {
      try {
        var config = require('../../configs/' + event.message.guild);
      } catch (e) {
        return event.message.channel.send(
          new MessageEmbed()
            .setTitle(' ')
            .setColor('#ff0000')
            .setDescription('This server does not have a lockdown configuration made, try asking the bot developers for one!')
            .setFooter('Try using ' + event.client.data.prefix + "info for the developer's name")
        );
      }
      channels = <TextChannel[]>event.message.guild.channels.cache.filter((c: GuildChannel) => c.type == 'text').array();
      if (config.lockdown.exclude != null) {
        channels = channels.filter((c: GuildChannel) => !config.lockdown.exclude.includes(c.id));
      } else if (config.lockdown.channels != null) {
        channels = channels.filter((c: GuildChannel) => config.lockdown.channels.includes(c.id));
      }
    } else {
      (<string>event.arguments[0]).split(' ').forEach((c: string) => {
        var channel: TextChannel | null =
          <TextChannel | null>event.message.guild?.channels.cache.get(c) ||
          <TextChannel | null>(
            event.message.guild?.channels.cache.filter((gc: GuildChannel) => gc.type == 'text' && gc.name.toLowerCase() == c.toLowerCase()).first()
          );

        if (channel != null) channels?.push(channel);
      });
    }

    if (channels.length < 1)
      return event.message.channel.send(new MessageEmbed().setTitle(' ').setColor('#ff0000').setDescription('Unable to find any channels to lock!'));

    event.arguments.shift();
    var reason: string = <string>event.arguments.join(' ').replace('`', '');

    var role: Role = event.message.guild.roles.everyone;

    if (role == null)
      return event.message.channel.send(new MessageEmbed().setTitle(' ').setColor('#ff0000').setDescription('Unable to find the default role!'));

    this.lockeddown.set(event.message.guild.id, channels);

    channels.forEach((c: TextChannel) => {
      c.send(
        new MessageEmbed()
          .setTitle(' ')
          .setColor(event.embedColor)
          .setDescription('The discord server is currently on lockdown!' + (reason.trim() == '' ? '' : '\nReason: `' + reason + '`'))
      );

      c.updateOverwrite(<Role>role, {
        SEND_MESSAGES: false
      });
    });

    event.message.channel.send(
      new MessageEmbed()
        .setTitle(' ')
        .setColor(event.embedColor)
        .setDescription('Successfully locked **' + channels.length + '** channel' + (channels.length > 1 ? 's' : '') + '!')
    );
  };
}

module.exports = (client: BotClient) => {
  return new lockdown(client);
};
