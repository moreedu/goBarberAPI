import Sequelize from 'sequelize';
import mongoose from 'mongoose';
import User from '../app/models/User';
import File from '../app/models/File';
import Appointment from '../app/models/Appointment';

// chamar os dados de configuração do banco de dados da pasta config.
import databaseConfig from '../config/database';

const models = [User, File, Appointment]; // Array onde insiro todos os models existentes

class Database {
  constructor() {
    this.init(); // Chamando método init.
    this.mongo();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }

  mongo() {
    this.mongoConnection = mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useFindAndModify: true,
      useUnifiedTopology: true,
    });
  }
}

export default new Database(); // chamo ele no arquivo app da raíz..
