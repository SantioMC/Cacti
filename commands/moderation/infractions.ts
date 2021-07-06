import {GuildMember, Message, MessageEmbed} from 'discord.js';
import {BotClient} from '../../utils/BotClient';
import {Command, ExecuteEvent, PermissionLevel} from '../../utils/Command';
import {IInfraction} from '../../models/infraction';
import mongoose from 'mongoose';
import ms from 'ms';
import {MessageButton} from 'discord-buttons';

class infractions extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'infractions',
      description: "Check a player's previous punishments",
      category: 'Moderation',
      aliases: ['inf', 'history', 'puns', 'punishments'],
      permissions: ['MANAGE_MESSAGES'],
      botPermissions: ['BAN_MEMBERS', 'MANAGE_ROLES'],
      permissionLevel: PermissionLevel.Default,
      arguments: [
        {
          name: 'user',
          description: 'The user to check infractions on',
          required: true,
          type: 'member'
        }
      ]
    });
  }

  execute = async (event: ExecuteEvent) => {
    const Infraction: mongoose.Model<IInfraction> = mongoose.model('Infraction');
    var message: Message = await event.message?.channel?.send(event.loadingEmote + ' Fetching infractions...');
    var member: GuildMember = <GuildMember>event.arguments.shift();

    if (event.message.guild == null) return;
    var infractions: IInfraction[] = await Infraction.find({ guild: event.message.guild.id, victim: member.id });

    if (infractions.length == 0)
      return message.edit('', new MessageEmbed().setTitle(' ').setColor(event.embedColor).setDescription('This user has no previous infractions!'));

    var infraction: IInfraction = infractions.reverse()[0];
    var embed: MessageEmbed = new MessageEmbed().setTitle(infraction.type).setColor(event.embedColor);

    var desc: string = '';
    // desc += '\n\n**' + infraction.type + '**';
    desc += '\n**Staff**: <@' + infraction.staff + '>';
    desc += '\n**Reason**: ' + infraction.reason;
    desc += '\n**Identifier**: `' + infraction.id + '`';
    desc += '\n\n**Date Punished**: ' + new Date(infraction.timePunished).toTimeString().replace(/ \(.+\)/i, '');
    desc +=
      '\n**Length**: ' +
      (infraction.type == 'WARN' || infraction.type == 'KICK' ? 'N/A' : infraction.length == -1 ? 'FOREVER' : ms(infractions.length, { long: true }));
    desc += '\n**Expires**: ' + (infraction.length == -1 ? 'NEVER' : ms(infraction.length, { long: true }));
    desc += '\n**Active**: ' + (infraction.active ? 'Yes' : 'No');
    desc += '\n';
    embed.setDescription(desc);
    embed.setFooter('ID ' + member.id + ' | Page: 1/' + infractions.length);

    var deleteBtn = new MessageButton().setID('cacti_inf_delete').setStyle('red').setDisabled(!infraction.active).setEmoji('861359372914524160');
    var backBtn = new MessageButton().setID('cacti_inf_back').setStyle('blurple').setDisabled(true).setLabel('<');
    var forwardBtn = new MessageButton()
      .setID('cacti_inf_forward')
      .setStyle('blurple')
      .setDisabled(infractions.length == 1)
      .setLabel('>');

    var data: Object = {
      embed,
      buttons: [deleteBtn, backBtn, forwardBtn]
    };

    message.edit(' ', data);
  };
}

module.exports = (client: BotClient) => {
  return new infractions(client);
};
