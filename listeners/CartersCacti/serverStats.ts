import { BotClient } from '../../utils/BotClient';
import { Listener } from '../../utils/Listener';
import { Channel, Guild, GuildChannel, GuildMember, Message, MessageAttachment, MessageEmbed, PartialGuildMember, TextChannel, User } from 'discord.js';
import fetch from 'node-fetch';

export class serverStats extends Listener {
  constructor(client: BotClient) {
    super(client, {
      name: 'Server Stats',
      guild: '696027249002020896'
    });

    client.on('guildMemberAdd', (member: GuildMember) => {
      if (member.guild.id != '696027249002020896') return;
      updateMembers(member.guild);
    });

    client.on('guildMemberRemove', (member: GuildMember | PartialGuildMember) => {
      if (member.guild.id != '696027249002020896') return;
      updateMembers(member.guild);
    });

    client.on('channelCreate', (channel: Channel) => {
      if (!(channel instanceof GuildChannel)) return;
      var guildChannel: GuildChannel = <GuildChannel>channel;
      if (guildChannel.guild.id != '696027249002020896') return;
      updateChannelCount(guildChannel.guild);
    });

    client.on('channelDelete', (channel: Channel) => {
      if (!(channel instanceof GuildChannel)) return;
      var guildChannel: GuildChannel = <GuildChannel>channel;
      if (guildChannel.guild.id != '696027249002020896') return;
      updateChannelCount(guildChannel.guild);
    });

    function updateChannelCount(guild: Guild) {
      var channels: GuildChannel | undefined = guild.channels.cache.get('721706194892357682');
      var channelCount = guild.channels.cache.size;

      channels?.setName(`Channels: ${channelCount}`);
    }

    async function updateMembers(guild: Guild) {
      var allMembers: GuildChannel | undefined = guild.channels.cache.get('721705530480918588');
      var members: GuildChannel | undefined = guild.channels.cache.get('721705533370793985');
      var bots: GuildChannel | undefined = guild.channels.cache.get('721705535812010056');

      var guildMembers = await guild.members.fetch();
      var botCount = guildMembers.filter((m: GuildMember) => m.user.bot).size;

      allMembers?.setName(`All Members: ${guild.memberCount}`);
      members?.setName(`Members: ${guild.memberCount - botCount}`);
      bots?.setName(`Bots: ${botCount}`);
    }
  }
}

module.exports = (client: BotClient) => {
  return new serverStats(client);
};
