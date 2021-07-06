import {Guild, Message, MessageEmbed} from 'discord.js';
import {BotClient} from '../../utils/BotClient';
import {Command, ExecuteEvent, PermissionLevel} from '../../utils/Command';

class serverinfo extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'serverinfo',
      description: 'Gets the info from the current guild',
      category: 'Utility',
      aliases: ['si', 'server', 'guild', 'guildinfo', 'gi'],
      permissionLevel: PermissionLevel.Default,
      arguments: []
    });
  }

  execute = async (event: ExecuteEvent) => {
    var message: Message = await event.message.channel.send(event.loadingEmote + ' Fetching server information...');

    var messageEmbed: MessageEmbed = new MessageEmbed()
      .setTitle(' ')
      .setColor(event.embedColor)
      .setFooter('Requested by ' + event.message.author.tag);

    var guild: Guild | null = event.message.guild;
    if (guild == null) return;

    messageEmbed.addField('Server Name', guild.name, true);
    messageEmbed.addField('Server ID', guild.id, true);
    messageEmbed.addField('\u200b', '\u200b', true);
    messageEmbed.addField('Owner', `<@${guild.ownerID}>`, true);
    messageEmbed.addField('Member Count', guild.memberCount + ' (' + guild.maximumMembers + ' max)', true);
    messageEmbed.addField('\u200b', '\u200b', true);
    messageEmbed.addField('Time Created', guild.createdAt.toDateString(), true);
    messageEmbed.addField('Region', guild.region, true);

    var bannerURL: string | null = guild.bannerURL();
    var iconURL: string | null = guild.iconURL();

    if (bannerURL != null) messageEmbed.setImage(bannerURL);
    if (iconURL != null) messageEmbed.setThumbnail(iconURL);

    message.edit('', messageEmbed);
  };
}

module.exports = (client: BotClient) => {
  return new serverinfo(client);
};
