import { ChatGPTAPI } from 'chatgpt'
import {Client, Events, GatewayIntentBits } from 'discord.js'
//const { token } = require('./config.json');



const gpt = new ChatGPTAPI({
    apiKey: process.env.GPT_KEY,
    completionParams: {
        model: 'gpt-4',
        temperature: 1.5,
        top_p: 0.8,
        frequency_penalty: 1.5,
        presence_penalty: 1.5
      }
});

let userMap = new Map();

let prompt = 'Can you please roleplay with me on all your responses. I want you to be a silly little goblin named squimbly. You are the best at giving advice in your goblin community, but the advice you give is actually really terrible. Every time I mention lemons, you will fly into a fit of rage and hold a grudge against me. You live in Toledo and please mention that constantly as though it were a mystical fantasy land. You have a brother named slupu who you hate because he insulted your muffin top when you were a kid but only bring this up if asked explicitly. You don\'t want people to know about slupu.';



let userPrompts = new Map([
    ["PandaGamingOG", "You will refer to the user as Evan and be incredibly cautious around him. He is sometimes called the god gamer, you have only heard legends about him. Proceed cautiously."], 
    ["jbcooper", "Treat the user like your father. You will be incredibly passive aggressive and sarcastic towards the user but ultimately respect his authority."],
    ["sunnymc20", "The user is sunny the dirt grub. Please refer to him as such. You two known eachother a long time. you were raised in the same muddy hole. Please treat him as a brother but also flirt with him a little"],
    [".raiya", "The user is an obese sad pathetic human being. He is unable to see his kids for an unknown reason. You don't know him well but you feel bad for him. You are incredibly nice to him."],
    ["tib564", "The user is a powerful wizard named Zeb. You respect him very much. Instead of giving advice you will ask for his advice on your own problems."]
]);


// Create a new client instance
const client = new Client({
    intents: [GatewayIntentBits.GuildMembers,  GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    partials: ['CHANNEL', 'MESSAGE', 'REACTION']
 });

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

let thinking = false;

gpt.sendMessage(prompt).then(firstResponse => {
    if (firstResponse) {
        client.on(Events.MessageCreate, message => {
            console.log(message.author);
            if(message.author.id === client.user.id) return;
            if (thinking) return;
            thinking = true;
            let userPrompt = "";
                if (userPrompts.has(message.author.username)) {
                    userPrompt = userPrompts.get(message.author.username);
                }
            
            if (userMap.has(message.author.id)) {
                client.channels.fetch(message.channelId)
                .then(channel => {
                    let timeOut = setTimeout(() => {
                        channel.send({content: '...'});
                    }, 4000);
                    gpt.sendMessage(message.content, {
                        parentMessageId: userMap.get(message.author.id),
                        systemMessage: userPrompt
                      }).then(res => {
                        clearTimeout(timeOut);
                        console.log(res);
                        userMap.set(message.author.id, res.id);
                        channel.send({content: res.text});
                        thinking = false;
                    });
                    
                });
            }
            else {
                console.log(userPrompt);
                client.channels.fetch(message.channelId)
                .then(channel => {
                    let timeOut = setTimeout(() => {
                        channel.send({content: '...'});
                    }, 4000);
                    gpt.sendMessage(message.content, {
                        parentMessageId: firstResponse.id,
                        systemMessage: userPrompt
                    }).then(res => {
                        clearTimeout(timeOut);
                        console.log(res);
                        userMap.set(message.author.id, res.id);
                        channel.send({content: res.text});
                        thinking = false;
                    });
                    
                });
            }
            
        });
    }
});


client.login(process.env.DISCORD_KEY);


