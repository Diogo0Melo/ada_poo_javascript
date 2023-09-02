/*
crie uma classe Calculadora, com métdos aritmeticos, por exemplo adicionar(), subtrair(), multiplicar(), etc... O construtor da classe deve receber um numero inicial, e depois os métodos devem modificar esse numero,  por fim um método resultado() para retornar o valor final.
exemplo de utilizaçao:
const calculadora = new Calculadora(52);
const resultado = calculadora.adicionar(50).subtrair(10).multiplicar(2).resultado()
*/

class Calculadora {
    constructor(numeroInicial) {
        this.numeroInicial = numeroInicial;
    }
    adicionar(numero) {
        this.verificacao(numero);
        this.numeroInicial += numero;
        return this;
    }
    subtrair(numero) {
        this.verificacao(numero);
        this.numeroInicial -= numero;
        return this;
    }
    multiplicar(numero) {
        this.verificacao(numero);
        this.numeroInicial *= numero;
        return this;
    }
    dividir(numero) {
        if (numero === 0) throw new Error("Divisão por zero");
        this.verificacao(numero);
        this.numeroInicial /= numero;
        return this;
    }
    potencia(numero) {
        this.verificacao(numero);
        this.numeroInicial **= numero;
        return this;
    }
    resultado() {
        return this;
    }
    verificacao(numero) {
        const novoNumero = +numero;
        if (novoNumero > 0) {
            return true;
        }
        throw new Error("Numero invalido");
    }
}

const num1 = new Calculadora(25);

num1.potencia(2).adicionar(5).subtrair(10).multiplicar(2).dividir(2);

console.log(num1.resultado());
