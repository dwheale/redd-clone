import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { MyContext } from "../types";
import { User } from "../entities/User";
import argon2 from 'argon2';
import { EntityManager } from '@mikro-orm/postgresql'

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string

  @Field()
  password: string
}

@ObjectType()
class FieldError {
  @Field(() => [String])
  field: String[]

  @Field()
  message: string
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]

  @Field(() => User, { nullable: true })
  user?: User
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async whoami(
    @Ctx() { req, em }: MyContext
  ) {
    if (!req.session.userId) {
      // not logged in
      return null;
    }
    return await em.findOne(User, {id: req.session.userId});
  }
  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [{
          field: ['username'],
          message: 'username length must be greater than 2'
        }]
      }
    }
    if (options.password.length < 6) {
      return {
        errors: [{
          field: ['password'],
          message: 'password length must be greater than 5'
        }]
      }
    }
    const hashedPassword = await argon2.hash(options.password);
    let user;
    try {
      const result = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          username: options.username,
          password: hashedPassword,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning('*');
      user = result[0];
    } catch (error) {
      if(error.code === '23505') {
        // duplicate username error
        return {
          errors: [{
            field: ['username'],
            message: 'A user with that name already exists'
          }]
        }
      }
      console.log('message: ', error.message);
    }
    // store user id session
    req.session.userId = user.id

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, {username: options.username});
    if (!user) {
      return {
        errors: [{
          field: ['username', 'password'],
          message: 'Invalid login',
        }]
      }
    }
    console.log(user.password)
    const valid = await argon2.verify(user.password, options.password);
    if (!valid) {
      return {
        errors: [{
          field: ['username', 'password'],
          message: 'Invalid login'
        }]
      }
    }
    req.session!.userId = user.id;
    return {
      user
    };
  }
}