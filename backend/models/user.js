const mongoose = require('mongoose'); // Importa o módulo mongoose para a criação e manipulação de esquemas e modelos no MongoDB.
const bcrypt = require('bcryptjs'); // Importa o módulo bcryptjs para realizar o hash de senhas e verificar a integridade delas.

// Define o esquema do modelo de usuário
const userSchema = new mongoose.Schema({
    username: { 
        type: String, // Define o campo 'username' como uma string.
        required: true, // Indica que o campo é obrigatório.
        unique: true // Garante que o valor seja único no banco de dados.
    },
    email: { 
        type: String, // Define o campo 'email' como uma string.
        required: true, // Indica que o campo é obrigatório.
        unique: true // Garante que o valor seja único no banco de dados.
    },
    password: { 
        type: String, // Define o campo 'password' como uma string.
        required: true // Indica que o campo é obrigatório.
    },
    fullName: { 
        type: String, // Define o campo 'fullName' como uma string.
        required: true // Indica que o campo é obrigatório.
    },
    birthDate: { 
        type: Date, // Define o campo 'birthDate' como um objeto Date.
        required: true // Indica que o campo é obrigatório.
    },
    gender: { 
        type: String, // Define o campo 'gender' como uma string.
        enum: ['Masculino', 'Feminino', 'Outro'], // Restringe os valores possíveis aos listados.
        required: true // Indica que o campo é obrigatório.
    },
    cpf: { 
        type: String, // Define o campo 'cpf' como uma string.
        required: true, // Indica que o campo é obrigatório.
        unique: true // Garante que o valor seja único no banco de dados.
    },
    phone: { 
        type: String, // Define o campo 'phone' como uma string.
        required: true // Indica que o campo é obrigatório.
    },
    address: { // Define o subdocumento 'address' para armazenar o endereço do usuário.
        cep: { 
            type: String, // Define o campo 'cep' como uma string.
            required: true // Indica que o campo é obrigatório.
        },
        logradouro: { 
            type: String // Define o campo 'logradouro' como uma string.
        },
        numero: { 
            type: String, // Define o campo 'numero' como uma string.
            required: true // Indica que o campo é obrigatório.
        },
        bairro: { 
            type: String // Define o campo 'bairro' como uma string.
        },
        cidade: { 
            type: String // Define o campo 'cidade' como uma string.
        },
        estado: { 
            type: String // Define o campo 'estado' como uma string.
        }
    }
});

// Middleware para hash de senha antes de salvar
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next(); // Verifica se a senha foi alterada antes de aplicar o hash.
    this.password = await bcrypt.hash(this.password, 10); // Aplica hash na senha com fator de custo 10.
    next(); // Continua para o próximo middleware ou salva o documento.
});

// Método para comparar senhas
userSchema.methods.comparePassword = function(password) {
    return bcrypt.compare(password, this.password); // Compara a senha fornecida com o hash armazenado.
};

// Middleware para normalizar o campo de gênero
userSchema.pre('validate', function (next) {
    if (this.gender) { // Verifica se o campo 'gender' está preenchido.
        this.gender = this.gender.charAt(0).toUpperCase() + this.gender.slice(1).toLowerCase(); // Normaliza o valor para capitalização correta.
    }
    next(); // Continua para o próximo middleware ou validação.
});

// Exporta o modelo, verificando se já existe para evitar recriação
module.exports = mongoose.models.User || mongoose.model('User', userSchema); // Usa um modelo existente ou cria um novo.
