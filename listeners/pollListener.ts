import { BotClient } from '../utils/BotClient';
import { Listener } from '../utils/Listener';
import { Emoji, GuildMember, MessageEmbed, MessageReaction, PartialUser, User } from 'discord.js';

export class afkListener extends Listener {
  constructor(client: BotClient) {
    super(client, {
      name: 'Poll Listener'
    });

    client.on('messageReactionAdd', async (reaction: MessageReaction, user: User | PartialUser) => {
      if (reaction.me || reaction.message.author.id != this.client.user?.id) return;
      if (reaction.message.embeds.length < 1) return;

      var embed: MessageEmbed = reaction.message.embeds[0];
      var embedData: string[] | undefined = embed.description?.split('\n');
      if (embedData == null || embedData[embedData.length - 1].includes('Poll closed') || !(embedData[0] == '**POLL**')) return;

      if (reaction.emoji.name == 'delete') {
        var member: GuildMember | undefined = await reaction.message.guild?.members.fetch(user.id);
        if (member == null) return;

        if (!member.hasPermission('MANAGE_MESSAGES')) return reaction.users.remove(member);
        var reactions = reaction.message.reactions.cache.array();
        for (var i in reactions) {
          var r: MessageReaction = reactions[i];
          if (r.emoji.name == 'delete') continue;
          var line: string = embedData[4 + parseInt(i)];
          var amount: number = r.count || 1;

          embedData[4 + parseInt(i)] = line + ' — ' + amount;
        }
        reaction.message.reactions.removeAll();
        embedData[embedData.length - 1] += ' | Poll closed by <@' + member.id + '>';
        embed.setDescription(embedData.join('\n'));
        embed.setColor('#ff0000');
        return reaction.message.edit(' ', embed);
      }
    });
  }
}

module.exports = (client: BotClient) => {
  return new afkListener(client);
};
