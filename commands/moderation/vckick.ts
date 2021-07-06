import { GuildMember, Message, MessageEmbed } from 'discord.js';
import { BotClient } from '../../utils/BotClient';
import { Command, ExecuteEvent, PermissionLevel } from '../../utils/Command';
import mongoose from 'mongoose';
import { IInfraction } from '../../models/infraction';
import { InfractionUtils } from '../../utils/InfractionUtils';

class vckick extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'vckick',
      description: 'Kick a user from the call',
      category: 'Moderation',
      aliases: ['voicekick'],
      permissions: ['MANAGE_MESSAGES'],
      botPermissions: ['MOVE_MEMBERS'],
      permissionLevel: PermissionLevel.Default,
      arguments: [
        {
          name: 'user',
          description: 'The user to kick out of the call',
          required: true,
          type: 'member'
        }
      ]
    });
  }

  execute = async (event: ExecuteEvent) => {
    var member: GuildMember = <GuildMember>event.arguments.shift();
    if (member.voice.channel == null)
      return event.message.channel.send(new MessageEmbed().setTitle(' ').setColor('#ff0000').setDescription('This user is not in a call!'));
    member.voice.kick();
    event.message.channel.send(
      new MessageEmbed()
        .setTitle(' ')
        .setColor(event.embedColor)
        .setDescription('Disconnected <@' + member.user.id + '> from their call!')
    );
  };
}

module.exports = (client: BotClient) => {
  return new vckick(client);
};
