import { BotClient } from '../../utils/BotClient';
import { Command, ExecuteEvent, PermissionLevel } from '../../utils/Command';
import { GuildMember, Message, MessageEmbed } from 'discord.js';


class bean extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'bean',
      description: 'Bean a member!',
      category: 'Fun',
      aliases: [],
      permissionLevel: PermissionLevel.Default,
      arguments: [
        {
          name: 'user',
          description: 'The user you want to bean',
          required: true,
          type: 'member'
        }
      ]
    });
  }

  execute = async (event: ExecuteEvent) => {
    var user: GuildMember = <GuildMember>event.arguments.shift();
    var bean = await event.message.channel.send(`Issuing Infraction...`)
    
    setTimeout(() => {
      bean.edit(``, new MessageEmbed()
      .setTitle(` `)
      .setDescription(`You have Successfully beaned <@${user.id}>!`)
      .setColor("148b47")
      .setImage(`https://cdn.discordapp.com/attachments/713921994592092181/880933422057537596/test.png`))
  }, 850);
  };
}

module.exports = (client: BotClient) => {
  return new bean(client);
};
