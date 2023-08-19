class Conta {
    static id = 0
    #agencia
    #nome
    #cpf
    #senha
    #saldo
    constructor(nome, cpf, senha) {
        this.id = ++Conta.id
        this.#agencia = "0096"
        this.#nome = nome
        this.#cpf = cpf
        this.#senha = senha
        this.#saldo = 0
        if (Metodos.validacoes(nome, cpf, senha)) throw 'Nenhuma conta foi cadastrada!'
        contas.push(this)
        mensagem.innerHTML = `<h2>Conta criada com sucesso! Faça login para acessar</h2>`
        mensagem.style.opacity = 1
        Metodos.tempoDaMensagem()

    }
    get agencia() {
        return this.#agencia
    }
    get nome() {
        return this.#nome
    }
    get cpf() {
        return this.#cpf
    }
    get saldo() {
        return this.#saldo
    }
    set saldo(saldo) {
        this.#saldo = saldo
    }
    login() {
        const senha = document.querySelector('#login-senha').value
        if (this.#senha === senha) {
            containerGeral.style.display = 'none'

            document.querySelector('#infomacoesDaConta').innerHTML = `
                Agência: ${this.agencia} - Conta: ${this.id}<br>
                Nome: ${this.nome} - CPF: ${this.cpf}<br>
                Saldo: ${this.saldo}
                `

            containerContaUsuario.style.display = 'block'

            return;
        }
        mensagem.innerHTML = `<h2 style="color: red;">CPF ou senha incorretos!</h2>`
        mensagem.style.opacity = 1

        Metodos.tempoDaMensagem()
    }
    sacar(valor) {
        if (this.saldo < valor) {
            mensagem.innerHTML = `<h2 style="color: red;">Saldo insuficiente!</h2>`
            mensagem.style.opacity = 1

            Metodos.tempoDaMensagem()
            throw 'Saldo insuficiente!'
        }
        this.saldo -= valor
    }
    depositar(valor) {
        this.saldo += valor
    }
    transferir(contaDestino, valor) {
        this.sacar(valor)
        contaDestino.depositar(valor)
    }
}
class Metodos {
    static cadastraConta() {
        const nome = document.querySelector('#signup-nome').value
        const cpf = document.querySelector('#signup-cpf').value
        const senha = document.querySelector('#signup-senha').value
        new Conta(nome, cpf, senha)
    }
    static login() {
        const cpf = document.querySelector('#login-cpf').value
        const conta = contas.find(conta => conta.cpf === cpf)
        if (conta === undefined) {
            mensagem.innerHTML = `<h2 style="color: red;">CPF ou senha incorretos!</h2>`
            mensagem.style.opacity = 1

            Metodos.tempoDaMensagem()
            return;
        }
        conta.login(conta)
    }
    static sair() {
        containerContaUsuario.style.display = 'none'
        containerGeral.style.display = 'block'
    }
    static acoesConta() {
        const cpf = document.querySelector('#login-cpf').value
        const conta = contas.find(conta => conta.cpf === cpf)
        const depositar = +document.querySelector('#depositar').value
        const sacar = +document.querySelector('#sacar').value
        const transferir = +document.querySelector('#transferir').value
        const cpfContaDestino = document.querySelector('#transferirConta').value
        const contaDestino = contas.find(conta => conta.cpf === cpfContaDestino)
        if (depositar > 0) {
            conta.depositar(depositar)
            mensagem.innerHTML = `<h2>Depósito realizado com sucesso!</h2>`
            mensagem.style.opacity = 1

            Metodos.tempoDaMensagem()
        }
        if (sacar > 0) {
            conta.sacar(sacar)
            mensagem.innerHTML = `<h2>Saque realizado com sucesso!</h2>`
            mensagem.style.opacity = 1

            Metodos.tempoDaMensagem()
        }
        if (transferir > 0 && contaDestino !== undefined) {
            mensagem.innerHTML = `<h2>Transferência realizada com sucesso!</h2>`
            mensagem.style.opacity = 1

            Metodos.tempoDaMensagem()
            conta.transferir(contaDestino, transferir)
        } else if (cpfContaDestino === undefined) {
            mensagem.innerHTML = `<h2>Conta de destino não encontrada!</h2>`
            mensagem.style.opacity = 1

            Metodos.tempoDaMensagem()
        }
        conta.login()
    }
    static validacoes(nome, cpf, senha) {
        if (!nome || !cpf || !senha) {
            mensagem.innerHTML = `<h2 style="color: red;">Preencha todos os campos!</h2>`
            mensagem.style.opacity = 1

            Metodos.tempoDaMensagem()
            return true
        }
        const regexNome = /^[A-Z]{1}[a-z]{2,20}/g;
        if (nome.length < 3 || !regexNome.test(nome)) {
            mensagem.innerHTML = `<h2 style="color: red;">Nome muito curto ou inválido!</h2>`
            mensagem.style.opacity = 1

            Metodos.tempoDaMensagem()
            return true
        }
        const cpfUtilizado = contas.find(conta => conta.cpf === cpf)
        const regexCpf = /\d{3}\.\d{3}\.\d{3}-\d{2}/
        if (!regexCpf.test(cpf) || cpfUtilizado || cpf.length !== 14) {
            mensagem.innerHTML = `<h2 style="color: red;">CPF inválido!</h2>`
            mensagem.style.opacity = 1

            Metodos.tempoDaMensagem()
            return true
        }
        if (senha.includes(" ")) {
            mensagem.innerHTML = `<h2 style="color: red;">A senha não pode conter espaços!</h2>`
            mensagem.style.opacity = 1

            Metodos.tempoDaMensagem()
            return true
        }
        return false
    }
    static tempoDaMensagem() {
        setTimeout(() => {
            mensagem.style.opacity = 0
        }, 3000)
    }
}
const mensagem = document.querySelector('#mensagem')
const containerGeral = document.querySelector('#container')
const containerContaUsuario = document.querySelector('#containerConta')
const contas = []
containerContaUsuario.style.display = 'none'
mensagem.style.opacity = 0
