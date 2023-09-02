// importamos a biblioteca discord.js
const { Client, GatewayIntentBits } = require("discord.js");
const { useInflection } = require("sequelize");

// criamos uma instancia do cliente discord.js
// o construtor da classe Client recebe um objeto como parametro
// o objeto contem todo o tipo de opçoes de configuração do Client
// a opção intents é obrigatória pelo Discord, ela define que tipo de eventos o Discord deve enviar para o nosso bot
// o objeto GatewayIntentBits fornece um atalho para definirmos quais eventos queremos receber
// aqui estamos informado ao Discord que queremos receber eventos sobre Guilds, ou seja quando o nosso bot entra e sai de servidores
// e tambem eventos sobre GuildMessages, ou seja quando sao postadas, editadas ou deletadas mensages em servidores
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// aqui temos o evento "ready", que é executado quando o nosso bot conecta com sucesso nos servidores do Discord.
client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// aqui temos o evento "messageCreate", que é executado sempre que o bot detecta que alguem postou uma mensagem no servidor.
client.on("messageCreate", (message) => {
    // o parametro message é uma instancia da classe Message (veja na documentação do discord.js)
    // ela contem todas as informações sobre a mensagem que foi postada, incluindo o seu conteudo e o seu autor

    const conteudo = message.content; // exemplo de acesso ao conteudo da mensagem
    const autor = message.author; // exemplo de acesso ao autor da mensagem
    const user = registeredUsers.get(autor.id);
    if (conteudo === "!Assinar CLT") {
        // message.channel é um atributo que contém uma instancia da classe TextChannel (veja na documentação do discord.js)
        // esta instancia representa o canal onde a mensagem foi postada
        // ela tambem possui o metodo "send()", que permite postar uma mensagem no canal em questão, e assim responder á mensagem postada
        if (registeredUsers.has(autor.id)) {
            message.channel.send(`Você já assinou a CLT!`);
        } else {
            registeredUsers.set(autor.id, new User(autor.username));
            message.channel.send(`Você assinou a CLT!`);
        }
    }
    if (conteudo === "!Trabalhar") {
        if (registeredUsers.has(autor.id)) {
            user.work(100);
            message.channel.send(`Você trabalhou eu ganhou 100 dinheiros!`);
        } else {
            message.channel.send(`Você ainda não assinou a CLT!`);
        }
    }
    if (conteudo.includes("!Transferir")) {
        if (registeredUsers.has(autor.id)) {
            const [command, nameTargetUser, getValue] = conteudo.split(" ");
            const targetUser = registeredUsers.find(
                (user) => user.name === nameTargetUser
            );
            const value = Number(getValue);
            if (targetUser && user.balance >= value) {
                user.transfer(value, targetUser);
                message.channel.send(
                    `Você transferiu ${value} dinheiros para ${targetUser.name}`
                );
            } else {
                message.channel.send(
                    "Você não tem dinheiro suficiente ou o destinatario não existe"
                );
            }
        }
    }
    if (conteudo.includes("apostar"))
        if (registeredUsers.has(autor.id)) {
            const [command, getValue, getNumber] = conteudo.split(" ");
            const value = Number(getValue);
            const number = Number(getNumber);
            const results = user.bet(value, number);
            if (results.result) {
                message.channel.send(
                    `Você apostou ${value} e ganhou ${
                        results.amount * number
                    } dinheiros!`
                );
            } else {
                message.channel.send(
                    `Você apostou ${value} e perdeu ${results.amount} dinheiros!`
                );
            }
        }
});

// aqui iniciamos o login do discord, fazendo com que ele conecte e ative o seu sistema de eventos que criamos acima.
client.login(
    "MTE0NzU2OTkyMTAyNzQ3MzU1OQ.GVmadc.pbiEvA6iwhsPRINeQTh47y2Vq1l9uZ8oq1jLt0"
);

class User {
    constructor(name) {
        this.name = name;
        this.balance = 0;
    }
    work(amount) {
        this.balance += amount;
    }
    transfer(amount, targetUser) {
        this.balance -= amount;
        targetUser.balance += amount;
    }
    bet(amount, number) {
        const randomNumebr = Math.floor(Math.random() * 10 + 1);
        if (randomNumebr === number) {
            this.balance += amount * number;
            return {
                result: true,
                amount: amount,
                balance: this.balance,
            };
        } else {
            this.balance -= amount;
            return {
                result: false,
                amount: amount,
                balance: this.balance,
            };
        }
    }
}
class Users extends Map {
    static addUser(user) {
        this.set(user.name, user);
    }
    find(callback) {
        let foundUser;
        this.forEach((user, key) => {
            const result = callback(user);
            if (result) {
                return (foundUser = key);
            }
        });
        return this.get(foundUser);
    }
}

const registeredUsers = new Users();
