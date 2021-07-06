import { GuildMember, Message, MessageEmbed } from 'discord.js';
import { BotClient } from '../../utils/BotClient';
import { Command, ExecuteEvent, PermissionLevel } from '../../utils/Command';
import mongoose from 'mongoose';
import { IInfraction } from '../../models/infraction';
import { InfractionUtils } from '../../utils/InfractionUtils';

class kick extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'kick',
      description: 'Send a warning out to a user',
      category: 'Moderation',
      permissions: ['MANAGE_MESSAGES'],
      permissionLevel: PermissionLevel.Default,
      arguments: [
        {
          name: 'user',
          description: 'The user to punish',
          required: true,
          type: 'member'
        },
        {
          name: 'reason',
          description: 'The reason to kick the user',
          required: false,
          type: 'string'
        }
      ]
    });
  }

  execute = async (event: ExecuteEvent) => {
    const Infraction: mongoose.Model<IInfraction> = mongoose.model('Infraction');
    var message: Message = await event.message?.channel?.send(event.loadingEmote + ' Issuing infraction...');

    if (event.message.guild == null) return;

    var user: GuildMember = <GuildMember>event.arguments.shift();
    event.unparsedArguments.shift();
    var reason: string = event.arguments.length < 1 ? 'No reason provided' : event.unparsedArguments.join(' ');

    if (!user.manageable || !user.kickable)
      return message.edit(' ', new MessageEmbed().setTitle(' ').setColor('#ff0000').setDescription('I am unable to issue an infraction towards this user!'));

    var id: string = await InfractionUtils.generateUniqueID(event.message.guild.id);

    Infraction.create({
      id: id,
      type: 'KICK',
      guild: event.message.guild.id,
      timePunished: new Date().getTime(),
      victim: user.id,
      staff: event.message.author.id,
      reason: reason
    });

    try {
      await user.send(
        new MessageEmbed()
          .setTitle(' ')
          .setColor(event.embedColor)
          .setDescription('**KICKED**\nYou were kicked' + (event.arguments.length < 1 ? '!' : ' for __' + reason + '__!'))
          .addField('Identifier', id, true)
          .addField('Date Punished', new Date().toTimeString().replace(/ \(.+\)/i, ''), true)
          .addField('\u200b', '\u200b', true)
      );
    } catch (_ignored) {}

    user.kick(reason + '\nKicked by ' + event.message.author.tag);

    message.edit(` `, new MessageEmbed().setTitle(' ').setDescription(`Successfully kicked <@${user.id}>!\nReason: \`${reason}\``).setColor(event.embedColor));
  };
}

module.exports = (client: BotClient) => {
  return new kick(client);
};
