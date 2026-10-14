const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Papéis: leitor (padrão de quem se cadastra) e bibliotecario (administra acervo,
// reservas, usuários e relatórios). O papel nunca vem do cadastro público.
const PAPEIS = ['leitor', 'bibliotecario'];

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    birthDate: { type: Date, required: true },
    gender: { type: String, enum: ['Masculino', 'Feminino', 'Outro'], required: true },
    cpf: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    role: { type: String, enum: PAPEIS, default: 'leitor' },
    address: {
        cep: { type: String, required: true },
        logradouro: { type: String },
        numero: { type: String, required: true },
        bairro: { type: String },
        cidade: { type: String },
        estado: { type: String },
    },
}, { timestamps: true });

// Hash da senha antes de salvar (só quando ela mudou)
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

// Normaliza o gênero ("masculino" -> "Masculino")
userSchema.pre('validate', function (next) {
    if (this.gender) {
        this.gender = this.gender.charAt(0).toUpperCase() + this.gender.slice(1).toLowerCase();
    }
    next();
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
User.PAPEIS = PAPEIS;
module.exports = User;
