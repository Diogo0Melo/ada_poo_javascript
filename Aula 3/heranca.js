/*
crie uma classe chamada Prisma que aceita um array de numeros, representando os valores dos lados do prisma.
crie subclasses para cada forma geometrica diferente, por exemplo triangulo, rectangulo, pentagono, etc... com metodos para calcular a sua área e o seu perimetro
*/
class Prisma {
    constructor(...lados) {
        this.lados = lados;
        this.perimetro = this.lados.reduce((acc, curr) => acc + curr, 0);
    }
}
class Triangulo extends Prisma {
    calcularArea() {
        return (this.lados[0] * this.lados[1]) / 2;
    }
}
class Retangulo extends Prisma {
    calcularArea() {
        return this.lados[0] * this.lados[1];
    }
}

const triangulo1 = new Triangulo(5, 10, 10);

const retangulo1 = new Retangulo(5, 10);

console.log(triangulo1.calcularArea());

console.log(retangulo1.calcularArea());
