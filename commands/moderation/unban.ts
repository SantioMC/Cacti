import { Message, MessageEmbed } from 'discord.js';
import { BotClient } from '../../utils/BotClient';
import { Command, ExecuteEvent, PermissionLevel } from '../../utils/Command';
import { IInfraction } from '../../models/infraction';
import { InfractionUtils } from '../../utils/InfractionUtils';

class unban extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'unban',
      description: 'Revokes a banishment infraction',
      category: 'Moderation',
      aliases: ['pardon'],
      permissions: ['MANAGE_MESSAGES'],
      botPermissions: ['BAN_MEMBERS'],
      permissionLevel: PermissionLevel.Default,
      arguments: [
        {
          name: 'id',
          description: 'The infraction or member id to unban',
          required: true,
          type: 'string'
        }
      ]
    });
  }

  execute = async (event: ExecuteEvent) => {
    var message: Message = await event.message?.channel?.send(event.loadingEmote + ' Revoking infraction...');
    var query: string = <string>event.arguments.shift();
    if (event.message.guild == null) return;

    var infraction: IInfraction | null = await InfractionUtils.getInfraction(event.message.guild.id, query, 'BAN');
    if (infraction == null)
      return message.edit(' ', new MessageEmbed().setTitle(' ').setColor(event.embedColor).setDescription('I was unable to find any active infraction!'));

    await InfractionUtils.expireInfraction(event.client, infraction);
    message.edit(
      ' ',
      new MessageEmbed()
        .setTitle(' ')
        .setColor(event.embedColor)
        .setDescription('Reverted the previous infraction on <@' + infraction.victim + '>')
    );
  };
}

module.exports = (client: BotClient) => {
  return new unban(client);
};
