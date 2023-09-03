// importamos a biblioteca discord.js
const { Client, GatewayIntentBits } = require("discord.js");
const { User, Users } = require("./classes");
const fs = require("fs");

const registeredUsers = new Users();

fs.readFile(`${__dirname}/database.json`, "utf8", (err, data) => {
    if (err) throw err;
    Array.prototype.forEach.call(JSON.parse(data), (user) => {
        registeredUsers.addUser(Object.keys(user)[0], Object.values(user));
    });
});

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

    if (conteudo === "!enviar curriculo") {
        // message.channel é um atributo que contém uma instancia da classe TextChannel (veja na documentação do discord.js)
        // esta instancia representa o canal onde a mensagem foi postada
        // ela tambem possui o metodo "send()", que permite postar uma mensagem no canal em questão, e assim responder á mensagem postada
        if (!!user) {
            message.channel.send(`Você já está empregado!`);
        } else {
            registeredUsers.set(autor.id, new User(autor.username));
            message.channel.send(`Você foi contratado!`);
        }
    }
    if (conteudo === "!trabalhar" && !!user) {
        if (!user.work(100)) {
            message.channel.send(
                `Você já trabalhou demais, descance um pouco!`
            );
        } else {
            message.channel.send(`Você trabalhou e ganhou 100 kwanzas!`);
        }
    }
    if (conteudo.includes("!transferir") && !!user) {
        const [, nameTargetUser, getValue] = conteudo.split(" ");
        const targetUser = registeredUsers.find(
            (user) => user.name === nameTargetUser
        );
        const value = Number(getValue);
        if (targetUser && user.balance >= value) {
            user.transfer(value, targetUser);
            message.channel.send(
                `Você transferiu ${value} kwanzas para ${targetUser.name}`
            );
        } else {
            message.channel.send(
                "Você não tem dinheiro suficiente ou o destinatario não existe"
            );
        }
    }
    if (conteudo.includes("!apostar") && !!user) {
        const [, getValue, getNumber] = conteudo.split(" ");
        const value = Number(getValue);
        const number = Number(getNumber);
        const results = user.bet(value, number);
        if (results.result) {
            message.channel.send(
                `Você apostou ${value} e ganhou ${
                    results.amount * number
                } kwanzas!`
            );
        } else {
            message.channel.send(
                `Você apostou ${value} e perdeu ${results.amount} kwanzas!`
            );
        }
    }
    if (conteudo === "!save" && user.isAdmin) {
        fs.writeFileSync(
            `${__dirname}/database.json`,
            JSON.stringify(registeredUsers.saveUsers())
        );
        message.channel.send("Salvo com sucesso!");
    }
});

// aqui iniciamos o login do discord, fazendo com que ele conecte e ative o seu sistema de eventos que criamos acima.
client.login(
    "MTE0NzU2OTkyMTAyNzQ3MzU1OQ.GVmadc.pbiEvA6iwhsPRINeQTh47y2Vq1l9uZ8oq1jLt0"
);
