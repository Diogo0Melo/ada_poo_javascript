class Conta {
    static id = 0;
    #agencia;
    #nome;
    #cpf;
    #senha;
    #saldo;
    constructor(nome, cpf, senha) {
        const senhaString = String(senha);
        this.id = ++Conta.id;
        this.#agencia = "0096";
        this.#nome = nome;
        this.#cpf = cpf;
        this.#senha = senhaString;
        this.#saldo = 0;
        if (Funcoes.validacoes(nome, cpf, senhaString))
            throw "Nenhuma conta foi cadastrada!";
        contas.push(this);
        mensagem.innerHTML = `<h2>Conta criada com sucesso! Faça login para acessar</h2>`;
        mensagem.style.opacity = 1;
        Funcoes.tempoDaMensagem();
    }
    get agencia() {
        return this.#agencia;
    }
    get nome() {
        return this.#nome;
    }
    get cpf() {
        return this.#cpf;
    }
    get saldo() {
        return this.#saldo;
    }
    set saldo(saldo) {
        this.#saldo = saldo;
    }
    login() {
        const senha = document.querySelector("#login-senha").value;
        if (this.#senha === senha) {
            containerGeral.style.display = "none";
            const idFormatado = this.id.toString().padStart(4, "0");
            document.querySelector("#infomacoesDaConta").innerHTML = `
                Agência/Conta: ${this.agencia}/${idFormatado}<br>
                Nome: ${this.nome} - CPF: ${this.cpf}<br>
                Saldo: R$ ${this.saldo}<br>
                `;

            containerContaUsuario.style.display = "block";

            return;
        }
        mensagem.innerHTML = `<h2 style="color: red;">CPF ou senha incorretos!</h2>`;
        mensagem.style.opacity = 1;

        Funcoes.tempoDaMensagem();
    }
    sacar(valor) {
        if (this.saldo < valor) {
            mensagem.innerHTML = `<h2 style="color: red;">Saldo insuficiente!</h2>`;
            mensagem.style.opacity = 1;

            Funcoes.tempoDaMensagem();
            throw "Saldo insuficiente!";
        }
        this.saldo -= valor;
    }
    depositar(valor) {
        this.saldo += valor;
    }
    transferir(contaDestino, valor) {
        if (contaDestino === this) {
            mensagem.innerHTML = `<h2 style="color: orange;">Você não pode transferir para a mesma conta</h2>`;
            mensagem.style.opacity = 1;
            Funcoes.tempoDaMensagem();
            throw "Você não pode transferir para a mesma conta!";
        }
        this.sacar(valor);
        contaDestino.depositar(valor);
    }
}
class Funcoes {
    static cadastrarConta() {
        const nome = document.querySelector("#signup-nome").value;
        const cpf = document.querySelector("#signup-cpf").value;
        const senha = document.querySelector("#signup-senha").value;
        new Conta(nome, cpf, senha);
    }
    static acessarConta() {
        const cpf = document.querySelector("#login-cpf").value;
        const conta = contas.find((conta) => conta.cpf === cpf);
        if (conta === undefined) {
            mensagem.innerHTML = `<h2 style="color: red;">CPF ou senha incorretos!</h2>`;
            mensagem.style.opacity = 1;

            Funcoes.tempoDaMensagem();
            return;
        }
        conta.login(conta);
        return conta;
    }
    static depositar() {
        const conta = this.opcoesDaConta();
        const depositar = +document.querySelector("#depositar").value;
        if (depositar > 0) {
            conta.depositar(depositar);
            mensagem.innerHTML = `<h2>Depósito realizado com sucesso!</h2>`;
            mensagem.style.opacity = 1;

            Funcoes.tempoDaMensagem();
            conta.login(conta);
            return;
        }
        mensagem.innerHTML = `<h2 style="color: red;">Erro ao depositar!</h2>`;
        mensagem.style.opacity = 1;
        Funcoes.tempoDaMensagem();
    }
    static sacar() {
        const conta = this.opcoesDaConta();
        const sacar = +document.querySelector("#sacar").value;
        if (sacar > 0) {
            conta.sacar(sacar);
            mensagem.innerHTML = `<h2>Saque realizado com sucesso!</h2>`;
            mensagem.style.opacity = 1;

            Funcoes.tempoDaMensagem();
            conta.login(conta);
            return;
        }
        mensagem.innerHTML = `<h2 style="color: red;">Erro ao sacar!</h2>`;
        mensagem.style.opacity = 1;
        Funcoes.tempoDaMensagem();
    }
    static transferir() {
        const conta = this.opcoesDaConta();
        const transferir = +document.querySelector("#transferir").value;
        const cpfContaDestino =
            document.querySelector("#transferirConta").value;
        const contaDestino = contas.find(
            (conta) => conta.cpf === cpfContaDestino
        );
        if (transferir > 0 && contaDestino !== undefined) {
            mensagem.innerHTML = `<h2>Transferência realizada com sucesso!</h2>`;
            mensagem.style.opacity = 1;

            Funcoes.tempoDaMensagem();
            conta.transferir(contaDestino, transferir);
            conta.login(conta);
        } else if (contaDestino === undefined && transferir > 0) {
            mensagem.innerHTML = `<h2 style="color: red;">Conta de destino não encontrada!</h2>`;
            mensagem.style.opacity = 1;

            Funcoes.tempoDaMensagem();
        } else {
            mensagem.innerHTML = `<h2 style="color: red;">Erro ao transferir!</h2>`;
            mensagem.style.opacity = 1;
        }
    }
    static validacoes(nome, cpf, senha) {
        if (!nome || !cpf || !senha) {
            mensagem.innerHTML = `<h2 style="color: red;">Preencha todos os campos!</h2>`;
            mensagem.style.opacity = 1;

            Funcoes.tempoDaMensagem();
            return true;
        }
        const regexNome = /^[A-Z]{1}[a-z]{2,20}$/g;
        if (!regexNome.test(nome)) {
            mensagem.innerHTML = `<h2 style="color: red;">Nome muito curto ou inválido!</h2>`;
            mensagem.style.opacity = 1;

            Funcoes.tempoDaMensagem();
            return true;
        }
        const cpfUtilizado = contas.find((conta) => conta.cpf === cpf);
        const regexCpf = /\d{3}\.\d{3}\.\d{3}-\d{2}/;
        if (!regexCpf.test(cpf) || cpfUtilizado || cpf.length !== 14) {
            mensagem.innerHTML = `<h2 style="color: red;">CPF inválido!</h2>`;
            mensagem.style.opacity = 1;

            Funcoes.tempoDaMensagem();
            return true;
        }
        if (senha.includes(" ")) {
            mensagem.innerHTML = `<h2 style="color: red;">A senha não pode conter espaços!</h2>`;
            mensagem.style.opacity = 1;

            Funcoes.tempoDaMensagem();
            return true;
        }
        return false;
    }
    static tempoDaMensagem() {
        setTimeout(() => {
            mensagem.style.opacity = 0;
        }, 3000);
    }
}
class Html {
    static tema = true;
    static opcoesDaConta = document.querySelector("#opcoesDaConta").style;
    static mudarTema() {
        const temaId = document.querySelector("#tema");
        if (Html.tema) {
            temaId.href = "dark.css";
            Html.tema = false;
        } else {
            temaId.href = "light.css";
            Html.tema = true;
        }
    }
    static depositarOpcao() {
        Html.opcoesDaConta.display = "none";
        document.querySelector("#depositarForm").style.display = "block";
    }
    static sacarOpcao() {
        Html.opcoesDaConta.display = "none";
        document.querySelector("#sacarForm").style.display = "block";
    }
    static transferirOpcao() {
        Html.opcoesDaConta.display = "none";
        document.querySelector("#transferirForm").style.display = "block";
    }
    static voltar() {
        const forms = document.querySelectorAll(
            "#depositarForm, #sacarForm, #transferirForm"
        );

        forms.forEach((form) => {
            form.style.display = "none";
        });
        Html.opcoesDaConta.display = "block";
    }
    static sair() {
        containerContaUsuario.style.display = "none";
        containerGeral.style.display = "flex";
    }
}
const mensagem = document.querySelector("#mensagem");
const containerGeral = document.querySelector("#container");
const containerContaUsuario = document.querySelector("#containerConta");
const contas = [];
