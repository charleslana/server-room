import bcrypt from 'bcrypt';
import HandlerError from 'handler/HandlerError';
import HandlerSuccess from 'handler/HandlerSuccess';
import IUserAuthenticate from 'interface/IUserAuthenticate';
import jwt from 'jsonwebtoken';
import UserModel from 'model/UserModel';
import UserRoleEnum from 'enum/UserRoleEnum';
import { formatDate, generateRandomString } from 'utils/utils';
import { UserRepository } from 'repository/UserRepository';
import { UserRoleService } from './UserRoleService';

export class UserService {
  private constructor() {}

  public static async createUserWithRole(
    username: string,
    password: string
  ): Promise<HandlerSuccess> {
    const existUser = await UserRepository.findUserByUsername(username);
    if (existUser) {
      throw new HandlerError('Já existe um usuário cadastrado com este nome.', 400);
    }
    const user = await this.createUser(username, password);
    await UserRoleService.create(user.id, UserRoleEnum.User);
    return new HandlerSuccess('Usuário cadastrado com sucesso.', 201);
  }

  public static async getUserById(id: string): Promise<UserModel> {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new HandlerError('Usuário não encontrado.', 404);
    }
    return user;
  }

  public static async getUserByProfileId(id: string): Promise<UserModel> {
    const user = await UserRepository.findByProfileId(id);
    if (!user) {
      throw new HandlerError('Usuário não encontrado.', 404);
    }
    return user;
  }

  public static async getAllUsers(): Promise<UserModel[]> {
    const users = await UserRepository.findAll();
    return users;
  }

  public static async getUserByUserIdAndAuthToken(
    id: string,
    authToken: string | null
  ): Promise<UserModel | null> {
    const user = await UserRepository.findByAuthToken(id, authToken);
    return user;
  }

  public static async authenticate(username: string, password: string): Promise<IUserAuthenticate> {
    const user = await UserRepository.findUserByUsername(username);
    if (!user) {
      throw new HandlerError('Impossível acessar, verifique e tente novamente.', 403);
    }
    this.validateUserLogin(user, password);
    const updatedUser = await UserService.updateAuthToken(user);
    const accessToken = this.generateToken(updatedUser);
    return {
      accessToken,
    };
  }

  private static validateUserLogin(user: UserModel, password: string): void {
    const isPasswordValid = this.decrypt(password, user.password);
    const isUserBanned = user.banned != null && user.banned > new Date();
    if (!isPasswordValid || isUserBanned) {
      let errorMessage = 'Impossível acessar, verifique e tente novamente.';
      if (isUserBanned) {
        errorMessage = `Impossível logar, o usuário está banido até ${formatDate(
          user.banned as Date
        )})`;
      }
      throw new HandlerError(errorMessage, 403);
    }
  }

  private static async updateAuthToken(user: UserModel): Promise<UserModel> {
    user.authToken = generateRandomString(100);
    const updatedUser = await UserRepository.update(user);
    return updatedUser;
  }

  private static generateToken(user: UserModel): string {
    const token = jwt.sign({ user }, process.env.JWT_SECRET as string, {
      expiresIn: '1d',
    });
    return token;
  }

  private static async createUser(username: string, password: string): Promise<UserModel> {
    const userModel = new UserModel();
    userModel.username = username;
    userModel.password = this.encrypt(password);
    const user = await UserRepository.save(userModel);
    return user;
  }

  private static encrypt(password: string): string {
    const salt = +(process.env.BCRYPT_SALT as string);
    return bcrypt.hashSync(`${password}${process.env.BCRYPT_PASSWORD}`, salt);
  }

  private static decrypt(password: string, hashPassword: string): boolean {
    return bcrypt.compareSync(`${password}${process.env.BCRYPT_PASSWORD}`, hashPassword);
  }
}
