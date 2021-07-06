import {BotClient} from '../../utils/BotClient';
import {Command, ExecuteEvent, PermissionLevel} from '../../utils/Command';
import {GuildMember, MessageEmbed} from 'discord.js';

class avatar extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'avatar',
      description: 'Sends you someones profile picture',
      category: 'Utility',
      aliases: ['av', 'pfp'],
      permissionLevel: PermissionLevel.Default,
      arguments: [
        {
          name: 'user',
          description: 'The user to fetch the avatar from',
          required: false,
          type: 'member'
        }
      ]
    });
  }

  execute = async (event: ExecuteEvent) => {
    var member: GuildMember = <GuildMember>event.arguments.shift() || event.message.member;
    var avatar: string | null = member.user.avatarURL({ dynamic: true, size: 1024 });
    if (avatar == null)
      return event.message.channel.send(
        new MessageEmbed()
          .setTitle(' ')
          .setColor('#ff0000')
          .setDescription('<@' + member.id + '> does not have a avatar!')
      );
    event.message.channel.send(new MessageEmbed().setTitle(' ').setColor(event.embedColor).setImage(avatar));
  };
}

module.exports = (client: BotClient) => {
  return new avatar(client);
};
