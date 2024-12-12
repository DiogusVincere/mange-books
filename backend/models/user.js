const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    birthDate: { type: Date, required: true },
    gender: { type: String, enum: ['Masculino', 'Feminino', 'Outro'], required: true },
    cpf: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: {
        cep: { type: String, required: true },
        logradouro: { type: String },
        numero: { type: String, required: true },
        bairro: { type: String },
        cidade: { type: String },
        estado: { type: String }
    }
});

// Hash da senha antes de salvar
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Comparação de senha
userSchema.methods.comparePassword = function(password) {
    return bcrypt.compare(password, this.password);
};

userSchema.pre('validate', function (next) {
    if (this.gender) {
        // Normaliza o gênero para capitalização correta
        this.gender = this.gender.charAt(0).toUpperCase() + this.gender.slice(1).toLowerCase();
    }
    next();
});

// Verifica se o modelo já foi registrado antes de criá-lo novamente
module.exports = mongoose.models.User || mongoose.model('User', userSchema);