import { GuildChannel, GuildMember, Message, MessageEmbed, VoiceChannel } from 'discord.js';
import { BotClient } from '../../utils/BotClient';
import { Command, ExecuteEvent, PermissionLevel } from '../../utils/Command';
import mongoose from 'mongoose';
import { IInfraction } from '../../models/infraction';
import { InfractionUtils } from '../../utils/InfractionUtils';

class moveall extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'moveall',
      description: 'Move everyone from one call to another',
      category: 'Utility',
      permissions: ['MOVE_MEMBERS'],
      botPermissions: ['MOVE_MEMBERS'],
      permissionLevel: PermissionLevel.Default,
      arguments: [
        {
          name: 'channel',
          description: 'The name of the voice channel to move everyone to',
          required: true,
          type: 'string'
        }
      ]
    });
  }

  execute = async (event: ExecuteEvent) => {
    if (event.message.guild == null) return;

    if (event.message.member?.voice.channel == null)
      return event.message.channel.send(new MessageEmbed().setTitle(' ').setColor('#ff0000').setDescription('You are not currently in a call!'));

    var channel: VoiceChannel | null = <VoiceChannel | null>(
      event.message.guild.channels.cache
        .filter((c: GuildChannel) => c.type == 'voice' && c.name.toLowerCase() == (<string>event.arguments[0]).toLowerCase())
        .first()
    );
    if (channel == null)
      return event.message.channel.send(new MessageEmbed().setTitle(' ').setColor('#ff0000').setDescription('Unknown channel! Did you spell the name right?'));

    var members: number = event.message.member.voice.channel.members.size;
    event.message.member.voice.channel.members.forEach((member: GuildMember) => {
      member.voice.setChannel(channel);
    });

    event.message.channel.send(
      new MessageEmbed()
        .setTitle(' ')
        .setColor(event.embedColor)
        .setDescription('Successfully moved **' + members + '** member' + (members > 1 ? 's' : '') + ' to `' + channel.name.replace('`', '') + '`!')
    );
  };
}

module.exports = (client: BotClient) => {
  return new moveall(client);
};
