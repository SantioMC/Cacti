import { GuildChannel, GuildMember, Message, MessageEmbed, Role } from 'discord.js';
import { BotClient } from '../../utils/BotClient';
import { Command, ExecuteEvent, PermissionLevel } from '../../utils/Command';
import { InfractionUtils } from '../../utils/InfractionUtils';
import ms from 'ms';

class mute extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'mute',
      description: 'Stop a user from speaking',
      category: 'Moderation',
      permissions: ['MANAGE_MESSAGES'],
      botPermissions: ['MANAGE_ROLES', 'MANAGE_CHANNELS'],
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
          description: 'The reason to mute the user',
          required: false,
          type: 'string'
        }
      ]
    });
  }

  execute = async (event: ExecuteEvent) => {
    var message: Message = await event.message?.channel?.send(event.loadingEmote + ' Issuing infraction...');
    if (event.message.guild == null) return;

    var user: GuildMember = <GuildMember>event.arguments.shift();
    event.unparsedArguments.shift();
    var length: number = InfractionUtils.getTime(event.unparsedArguments[0]);
    var reason: string = InfractionUtils.getReason(event.unparsedArguments);

    if (!user.manageable || !user.kickable)
      return message.edit(' ', new MessageEmbed().setTitle(' ').setColor('#ff0000').setDescription('I am unable to issue an infraction towards this user!'));

    event.message.delete();

    await event.message.guild.roles.fetch();
    var role: Role =
      event.message.guild.roles.cache.filter((r: Role) => r.name.toLowerCase() == 'muted').first() ||
      (await event.message.guild.roles.create({
        data: {
          name: 'Muted',
          color: '#010101'
        },
        reason: 'Automatically construct muted role'
      }));

    event.message.guild.channels.cache.forEach((channel: GuildChannel) => {
      channel.updateOverwrite(role, {
        SEND_MESSAGES: false,
        SPEAK: false,
        ADD_REACTIONS: false
      });
    });

    await user.roles.add(role, `Cacti Infraction | Muted by: ${event.message.author.tag} (ID: ${event.message.author.id}) | Reason: ${reason}`);
    var formattedLength = length == -1 ? 'FOREVER' : ms(length, { long: true });

    message.edit(
      ` `,
      new MessageEmbed()
        .setTitle(' ')
        .setDescription(`Successfully muted <@${user.id}>!\nReason: \`${reason}\`\nDuration: \`${formattedLength}\``)
        .setColor(event.embedColor)
    );

    var id: string = await InfractionUtils.generateUniqueID(event.message.guild.id);
    var updated: boolean = await InfractionUtils.issueInfraction({
      id: id,
      type: 'MUTE',
      length: length,
      guild: event.message.guild.id,
      victim: user.id,
      staff: event.message.author.id,
      reason: reason
    });

    try {
      if (!updated) {
        user.send(
          new MessageEmbed()
            .setTitle(' ')
            .setColor(event.embedColor)
            .setDescription('**MUTED**\nYou were muted for __' + reason + '__!')
            .addField('Identifier', id, true)
            .addField('Date Punished', new Date().toTimeString().replace(/ \(.+\)/i, ''), true)
            .addField('Duration', formattedLength, true)
        );
      } else {
        user.send(
          new MessageEmbed()
            .setTitle(' ')
            .setColor(event.embedColor)
            .setDescription('**MUTED**\nYour previous infraction was updated!')
            .addField('Date Punished', new Date().toTimeString().replace(/ \(.+\)/i, ''), true)
            .addField('Duration', formattedLength, true)
            .addField('Reason', reason, true)
        );
      }
    } catch (_ignored) {}
  };
}

module.exports = (client: BotClient) => {
  return new mute(client);
};
