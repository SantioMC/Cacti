import { GuildMember, Message, MessageEmbed, User } from "discord.js";
import { BotClient } from '../../utils/BotClient';
import { Command, ExecuteEvent, PermissionLevel } from '../../utils/Command';
import { InfractionUtils } from '../../utils/InfractionUtils';
import ms from 'ms';

class ban extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'ban',
      description: 'Banish a user from the discord server',
      category: 'Moderation',
      permissions: ['BAN_MEMBERS'],
      botPermissions: ['BAN_MEMBERS'],
      permissionLevel: PermissionLevel.Default,
      arguments: [
        {
          name: 'user',
          description: 'The user to punish',
          required: true,
          type: 'user'
        },
        {
          name: 'reason',
          description: 'The reason to ban the user',
          required: false,
          type: 'string'
        }
      ]
    });
  }

  execute = async (event: ExecuteEvent) => {
    var message: Message = await event.message?.channel?.send(event.loadingEmote + ' Issuing infraction...');
    if (event.message.guild == null) return;

    var user: User = <User>event.arguments.shift();
    event.unparsedArguments.shift();
    var shouldDelete: string | undefined = event.unparsedArguments.filter((s: string) => s.startsWith('d:'))[0];
    if (shouldDelete != undefined) event.unparsedArguments = event.unparsedArguments.filter((s: string) => !s.startsWith('d:'));
    var deleteLength: number = shouldDelete != undefined && !isNaN(Number(shouldDelete.substring(2))) ? Number(shouldDelete.substring(2)) : 1;
    var length: number = InfractionUtils.getTime(event.unparsedArguments[0]);
    var reason: string = InfractionUtils.getReason(event.unparsedArguments);

    if (deleteLength != 0 && (deleteLength > 7 || deleteLength < 1)) {
      return message.edit(
        ' ',
        new MessageEmbed().setTitle(' ').setColor('#ff0000').setDescription('You can only delete messages from this player between 1 to 7 days!')
      );
    }

    var member: GuildMember = await event.message.guild?.members?.fetch(user);
    if (member != null && (!member.manageable || !member.bannable))
      return message.edit(' ', new MessageEmbed().setTitle(' ').setColor('#ff0000').setDescription('I am unable to issue an infraction towards this user!'));

    await event.message.guild?.members?.ban(user, {
      reason: `Cacti Infraction | Banned by: ${event.message.author.tag} (ID: ${event.message.author.id}) | Reason: ${reason}`,
      days: deleteLength
    });

    var formattedLength = length == -1 ? 'FOREVER' : ms(length, { long: true });
    await message.edit(
      ` `,
      new MessageEmbed()
        .setTitle(' ')
        .setDescription(`Successfully banned <@${user.id}>!\nReason: \`${reason}\`\nDuration: \`${formattedLength}\``)
        .setColor(event.embedColor)
    );

    var id: string = await InfractionUtils.generateUniqueID(event.message.guild.id);
    var updated: boolean = await InfractionUtils.issueInfraction({
      id: id,
      type: 'BAN',
      length: length,
      guild: event.message.guild.id,
      victim: user.id,
      staff: event.message.author.id,
      reason: reason
    });

    try {
      if (!updated) {
        await user.send(
          new MessageEmbed()
            .setTitle(' ')
            .setColor(event.embedColor)
            .setDescription('**BANNED**\nYou were banned for __' + reason + '__!')
            .addField('Identifier', id, true)
            .addField('Date Punished', new Date().toTimeString().replace(/ \(.+\)/i, ''), true)
            .addField('Duration', formattedLength, true)
        );
      } else {
        await user.send(
          new MessageEmbed()
            .setTitle(' ')
            .setColor(event.embedColor)
            .setDescription('**BANNED**\nYour previous infraction was updated!')
            .addField('Date Punished', new Date().toTimeString().replace(/ \(.+\)/i, ''), true)
            .addField('Duration', formattedLength, true)
            .addField('Reason', reason, true)
        );
      }
    } catch (_ignored) {}
  };
}

module.exports = (client: BotClient) => {
  return new ban(client);
};
