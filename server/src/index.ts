import 'reflect-metadata';
import { MikroORM } from "@mikro-orm/core";
import microConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from 'type-graphql';
import { PostResolver, UserResolver, HelloResolver } from "./resolvers";
import session from 'express-session';
import redis from 'redis';
import { __prod__, __redis_password__, __session_secret__ } from './constants';
import { MyContext } from "./types";
import cors from 'cors';

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();

  const app = express();
  const RedisStore = require('connect-redis')(session);
  const redisClient = redis.createClient({
    host: 'redis.wheale.dev',
    port: 6379,
    password: __redis_password__
  })
  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }))

  app.use(
    session({
      name: 'qid',
      store: new RedisStore({client: redisClient, disableTouch: true}),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: 'lax', // csrf
        // secure: __prod__ // cookie only works in https
      },
      saveUninitialized: false,
      secret: __session_secret__,
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({req, res}) => <MyContext>({em: orm.em, req, res}),
  });

  apolloServer.applyMiddleware({ app, cors: false });
  app.listen(4000, () => {
    console.log('server started on localhost:4000');
  });
};

main().catch(err => {
  console.log(err);
});