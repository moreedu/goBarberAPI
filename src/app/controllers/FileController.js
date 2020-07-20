import File from '../models/File';

class FileController {
  async store(req, res) {
    // Do req.file ele retira as informações originalname e filename gerados no middleware multer, que vem no rotas.
    const { originalname: name, filename: path } = req.file;

    const file = await File.create({
      name,
      path,
    });

    return res.json(file);
  }
}

export default new FileController();
