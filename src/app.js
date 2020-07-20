/* eslint-disable new-cap */
// Este é o arquivo da estrutura da aplicação com os middlewares e Rotas
import 'dotenv/config';
import express from 'express';
import Youch from 'youch';
import cors from 'cors';
import path from 'path';
import * as Sentry from '@sentry/node';
import 'express-async-errors';

import routes from './routes';
import sentryConfig from './config/sentry';

import './database'; // importando o index da pasta database

class app {
  constructor() {
    this.server = express();

    Sentry.init(sentryConfig);

    // Se eu não inserir no constructor nunca irão rodar tanto middlewares como as rotasyar
    this.middlewares();
    this.routes();
    this.exceptionHandler();
  }

  middlewares() {
    this.server.use(Sentry.Handlers.requestHandler());
    this.server.use(cors());
    this.server.use(express.json()); // Requisições serem chamadas no formato Json
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes); // Chamando as rotas, em forma de middlewares com .use
  }

  exceptionHandler() {
    this.server.use(async (err, req, res, next) => {
      // if (process.env.NODE_ENV === 'development') {
      const errors = await new Youch(err, req).toJSON();

      return res.status(500).json(errors);
      // }

      // return res.status(500).json({ error: 'Internal server error' });
    });
  }
}

export default new app().server;
