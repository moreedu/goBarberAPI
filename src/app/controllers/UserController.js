/* eslint-disable no-console */
import * as YUP from 'yup';
import User from '../models/User';
import File from '../models/File';

class UserController {
  async store(req, res) {
    // Gerando módulo de validação dos dados para cadastro novo usuário
    const schema = YUP.object().shape({
      name: YUP.string().required(),
      email: YUP.string()
        .email()
        .required(),
      password: YUP.string()
        .required()
        .min(6),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ erro: 'Validation Fails' });
    }
    // Fim do módulo de validação

    const userExists = await User.findOne({ where: { email: req.body.email } });

    if (userExists) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    const { id, name, email, provider } = await User.create(req.body);

    return res.json({
      id,
      name,
      email,
      provider,
    });
  }

  async update(req, res) {
    // Gerando módulo de validação dos dados para edição de usuário cadastrado
    const schema = YUP.object().shape({
      name: YUP.string(),
      email: YUP.string().email(),
      oldPassword: YUP.string().min(6),
      password: YUP.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ), // oldPassword ? indica que função field.required() irá rodar apenas se o old estiver preenchido
      confirmPassword: YUP.string().when('password', (password, field) =>
        password ? field.required().oneOf([YUP.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ erro: 'Validation Fails' });
    }

    const { email, oldPassword } = req.body;

    // Ele encontra o usuário que foi autenticado no middleware auth
    const user = await User.findByPk(req.userId);

    if (email !== user.email) {
      const userExists = await User.findOne({ where: { email } });

      if (userExists) {
        return res.status(400).json({ error: 'User already exists' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match' });
    }
    // Próxima linha realiza a atualização após as conferências anteriores
    await user.update(req.body);

    const { id, name, avatar } = await User.findByPk(req.userId, {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json({
      id,
      name,
      email,
      avatar,
    });
  }
}

export default new UserController();
