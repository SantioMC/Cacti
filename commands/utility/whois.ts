import {GuildMember, Message, MessageEmbed, Role} from 'discord.js';
import {BotClient} from '../../utils/BotClient';
import {Command, ExecuteEvent, PermissionLevel} from '../../utils/Command';

class whois extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'whois',
      description: "Check a player's details",
      category: 'Utility',
      aliases: ['user', 'userinfo', 'ui'],
      permissionLevel: PermissionLevel.Default,
      arguments: [
        {
          name: 'user',
          description: 'The user to get information on',
          type: 'member',
          required: false
        }
      ]
    });
  }

  execute = async (event: ExecuteEvent) => {
    var message: Message = await event.message.channel.send(event.loadingEmote + ' Fetching information...');

    var user: GuildMember | null = event.members.length >= 1 ? event.members[0] : event.message.member;
    if (user == null) return message.edit(':x: Unable to find user information!');

    var roles: string[] = user.roles?.cache
      .sort((r1: Role, r2: Role) => r2.position - r1.position)
      .filter((r: Role) => r.name != '@everyone')
      .map((r: Role) => '<@&' + r.id + '>');

    var embed: MessageEmbed = new MessageEmbed()
      .setTitle(' ')
      .setColor(event.embedColor)
      .setDescription('Information for <@' + user.user.id + '>')
      .addField('Discord Tag', user.user.tag, true)
      .addField('Nickname', user.nickname == null ? 'None' : user.nickname, true)
      .addField('\u200b', '\u200b', true)
      .addField('Account Registered', user.user.createdAt.toDateString(), true)
      .addField('Join Date', user.joinedAt == null ? 'Unknown' : user.joinedAt.toDateString(), true)
      .addField('Roles (' + roles.length + ')', roles.length == 0 ? 'None' : roles.join(' '))
      .setFooter(`ID: ${user.user.id} | Requested by ${event.message.author.tag}`);

    var avatarURL: string | null = user.user.avatarURL();
    if (avatarURL != null) embed.setThumbnail(avatarURL);

    message.edit(' ', embed);
  };
}

module.exports = (client: BotClient) => {
  return new whois(client);
};
