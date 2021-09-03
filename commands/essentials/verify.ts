import { BotClient } from '../../utils/BotClient';
import { Command, ExecuteEvent, PermissionLevel } from '../../utils/Command';
import { GuildMember, Message, MessageEmbed } from 'discord.js';
import { EventEmitter } from 'stream';
import ms from 'ms';

class verify extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'verify',
      description: 'Verify yourself!',
      category: 'essentials',
      aliases: [],
      permissionLevel: PermissionLevel.Default,
      arguments: [],
      guild: '696027249002020896'
    });
  }

  execute = async (event: ExecuteEvent) => {
    var roles = await event.message.guild?.roles.fetch();
    var role = roles?.cache.get('706949966823948439');
    if (role == undefined) return;

    var expected = event.message.author.createdTimestamp + 1209600000;
    var length = ms(expected - Date.now(), { long: true });

    if (event.message.channel.id != '832719828849786891') return;
    if (event.message.member?.roles.cache.has(role.id)) return;
    if (expected > Date.now())
      return event.message.channel.send(
        new MessageEmbed().setTitle(' ').setDescription(`Your account is less than 14 days old! Try again in __${length}__!`).setColor('#ff0000')
      );

    event.message.member?.roles.add(role);
    event.message.channel.send(new MessageEmbed().setTitle(' ').setDescription('You have successfully verified!').setColor(event.embedColor));
  };
}

module.exports = (client: BotClient) => {
  return new verify(client);
};
