module.exports = {
    // Exporta um objeto para ser usado em outras partes da aplicação.
    mongodbURI: process.env.MONGODB_URI,
    // Define a propriedade 'mongodbURI' que pega o valor da variável de ambiente 'MONGODB_URI'.
    // Esta variável contém a URI de conexão ao banco de dados MongoDB.

    jwtSecret: process.env.JWT_SECRET,
    // Define a propriedade 'jwtSecret' que pega o valor da variável de ambiente 'JWT_SECRET'.
    // Este valor é usado como chave secreta para a geração e validação de tokens JWT (JSON Web Token).
};