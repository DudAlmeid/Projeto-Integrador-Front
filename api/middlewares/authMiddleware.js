const jwt = require("jsonwebtoken");
const usuarioService = require("../services/usuariosService");
require("dotenv").config({ path: `${__dirname}/../.env` });

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ error: "Token não fornecido" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
    );
    const usuario = await usuarioService.getUsuarioById(decoded.id);

    if (!usuario) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }

    req.user = usuario;
    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido" });
  }
};
