import { BotClient } from '../utils/BotClient';
import { Listener } from '../utils/Listener';
import { MessageButton, MessageComponent } from 'discord-buttons';
import { GuildMember, MessageEmbed, Role } from 'discord.js';
import mongoose from 'mongoose';
import { IInfraction } from '../models/infraction';
import ms from 'ms';
import { InfractionUtils } from '../utils/InfractionUtils';

export class infractionListener extends Listener {
  constructor(client: BotClient) {
    super(client, {
      name: 'Infractions Listener'
    });

    client.on('guildMemberAdd', async (member: GuildMember) => {
      var inf: IInfraction | null = await InfractionUtils.getLatestActiveInfraction(member.guild.id, member.id, 'MUTE');
      if (inf == null) return;

      await member.guild.roles.fetch();
      var role: Role | undefined = member.guild.roles.cache.filter((r: Role) => r.name.toLowerCase() == 'muted').first();
      if (role == null) return;

      member.roles.add(role);
    });

    client.on('clickButton', async (button: MessageComponent) => {
      const Infraction: mongoose.Model<IInfraction> = mongoose.model('Infraction');
      var btnData: string[] = button.id.split('_');
      if (btnData[0] != 'cacti' || btnData[1] != 'inf') return;

      if (button.message.author.id != this.client.user?.id) return;
      if (button.message.embeds.length < 1) return;
      if (button!.message.member?.hasPermission('MANAGE_MESSAGES')) return;

      var embed: MessageEmbed = button.message.embeds[0];
      var embedData: string[] | undefined = embed.description?.split('\n');
      button.reply.defer(true);
      if (embedData == null || embedData.length < 3 || !embedData[2].startsWith('**Identifier**:')) return;

      var footer: string | undefined = embed.footer?.text;
      if (footer == null) return;
      var page: number = parseInt(footer.split(' | ')[1].substring(5).split('/')[0]);
      var maxPage: number = parseInt(footer.split('/')[1]);
      var newEmbed: MessageEmbed = new MessageEmbed().setTitle(' ').setColor(this.client.data.embedColor);
      var user: string = footer.split(' | ')[0].substring(3);

      var id: string = embedData[2].substring(17, embedData[2].length - 1);
      var inf: IInfraction | null = null;

      if (btnData[2] == 'delete') {
        inf = await Infraction.findOne({ guild: button.message.guild?.id, id: id });
        if (inf == null) return;
        await InfractionUtils.expireInfraction(this.client, inf);
      } else if (btnData[2] == 'back') {
        page--;
        var infractions: IInfraction[] = await Infraction.find({ guild: button.message.guild?.id, victim: user });
        inf = infractions.reverse()[page - 1];
      } else if (btnData[2] == 'start') {
        page = 1;
        var infractions: IInfraction[] = await Infraction.find({ guild: button.message.guild?.id, victim: user });
        inf = infractions.reverse()[0];
      } else if (btnData[2] == 'forward') {
        page++;
        var infractions: IInfraction[] = await Infraction.find({ guild: button.message.guild?.id, victim: user });
        inf = infractions.reverse()[page - 1];
      }

      if (inf == null) return;

      var desc: string = '';
      // desc += '\n\n**' + infraction.type + '**';
      desc += '\n**Staff**: <@' + inf.staff + '>';
      desc += '\n**Reason**: ' + inf.reason;
      desc += '\n**Identifier**: `' + inf.id + '`';
      desc += '\n\n**Date Punished**: ' + new Date(inf.timePunished).toTimeString().replace(/ \(.+\)/i, '');
      desc += '\n**Length**: ' + (inf.type == 'WARN' || inf.type == 'KICK' ? 'N/A' : inf.length == -1 ? 'FOREVER' : ms(inf.length, { long: true }));
      desc += '\n**Expires**: ' + (inf.length == -1 ? 'NEVER' : ms(inf.length, { long: true }));
      desc += '\n**Active**: ' + (inf.active ? 'Yes' : 'No');
      desc += '\n';
      newEmbed.setTitle(inf.type);
      newEmbed.setDescription(desc);
      newEmbed.setFooter('ID ' + user + ' | Page ' + page + '/' + maxPage);

      var deleteBtn = new MessageButton()
        .setID('cacti_inf_delete')
        .setStyle('red')
        .setDisabled(!inf.active || ['KICK', 'WARN'].includes(inf.type))
        .setEmoji('861359372914524160');
      var startBtn = new MessageButton().setID('cacti_inf_start').setStyle('blurple').setLabel('<<');
      var backBtn = new MessageButton()
        .setID('cacti_inf_back')
        .setStyle('blurple')
        .setDisabled(page == 1)
        .setLabel('<');
      var forwardBtn = new MessageButton()
        .setID('cacti_inf_forward')
        .setStyle('blurple')
        .setDisabled(page == maxPage)
        .setLabel('>');

      var buttons: Array<MessageButton> = [deleteBtn];
      if (page > 2) buttons.push(startBtn);
      buttons.push(backBtn, forwardBtn);

      var data: Object = {
        embed: newEmbed,
        buttons
      };

      button.message.edit(' ', data);
    });
  }
}

module.exports = (client: BotClient) => {
  return new infractionListener(client);
};
