import { BotClient } from '../../utils/BotClient';
import { Command, ExecuteEvent, PermissionLevel } from '../../utils/Command';
import { Collection, GuildMember, Message, MessageEmbed, TextChannel } from 'discord.js';

class clean extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'clean',
      description: 'Manage messages in bulk',
      category: 'Moderation',
      aliases: ['purge'],
      permissions: ['MANAGE_MESSAGES'],
      botPermissions: ['MANAGE_MESSAGES'],
      permissionLevel: PermissionLevel.Default,
      arguments: [
        {
          name: 'amount',
          description: 'The amount of messages to delete',
          required: true,
          type: 'integer'
        },
        {
          name: 'user',
          description: 'The user to affect',
          required: false,
          type: 'member'
        }
      ]
    });
  }

  execute = async (event: ExecuteEvent) => {
    await event.message.delete();

    var amount: number = <number>event.arguments.shift();
    if (amount < 2 || amount > 100)
      return event.message.channel.send(
        new MessageEmbed().setTitle(' ').setColor(event.embedColor).setDescription('You can only delete up to 100 messages! (min of 2)')
      );

    var deleted: Collection<string, Message> = new Collection();
    if (event.arguments.length < 2) {
      deleted = await (<TextChannel>event.message.channel).bulkDelete(amount, true);
    } else {
      var user: GuildMember = <GuildMember>event.arguments.shift();

      event.message.channel.messages.fetch().then(async (messages: Collection<string, Message>) => {
        messages = messages.filter((m: Message) => m.author.id == user.id);
        deleted = await (<TextChannel>event.message.channel).bulkDelete(messages.array().slice(0, amount));
      });
    }

    event.message.channel
      .send(
        new MessageEmbed()
          .setTitle(' ')
          .setColor(event.embedColor)
          .setDescription('Successfully deleted **' + deleted.size + '** message' + (deleted.size > 1 ? 's' : '') + '!')
      )
      .then((m: Message) => m.delete({ timeout: 3000 }));
  };
}

module.exports = (client: BotClient) => {
  return new clean(client);
};
