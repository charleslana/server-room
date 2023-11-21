import UserModel from 'model/UserModel';
import UserRoleModel from 'model/UserRoleModel';
import { Op } from 'sequelize';

export class UserRepository {
  private constructor() {}

  public static async save(user: UserModel): Promise<UserModel> {
    const savedUser = await user.save();
    return savedUser;
  }

  public static async findUserByUsername(username: string): Promise<UserModel | null> {
    const user = await UserModel.findOne({
      include: [
        {
          model: UserRoleModel,
          as: 'roles',
        },
      ],
      where: {
        username: {
          [Op.iLike]: username,
        },
      },
    });
    return user;
  }

  public static async findById(id: string): Promise<UserModel | null> {
    const user = await UserModel.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: UserRoleModel,
          as: 'roles',
        },
      ],
    });
    return user;
  }

  public static async findByProfileId(id: string): Promise<UserModel | null> {
    const user = await UserModel.findByPk(id, {
      attributes: { exclude: ['authToken', 'password', 'banned'] },
    });
    return user;
  }

  public static async findByIdWithPassword(id: string): Promise<UserModel | null> {
    const user = await UserModel.findByPk(id, {
      include: [
        {
          model: UserRoleModel,
          as: 'roles',
        },
      ],
    });
    return user;
  }

  public static async findAll(): Promise<UserModel[]> {
    const users = await UserModel.findAll({
      attributes: { exclude: ['authToken', 'password', 'banned'] },
    });
    return users;
  }

  public static async findByAuthToken(
    id: string,
    authToken: string | null
  ): Promise<UserModel | null> {
    const user = await UserModel.findOne({
      where: {
        id: id,
        authToken: authToken,
      },
    });
    return user;
  }

  public static async update(user: UserModel): Promise<UserModel> {
    const updatedUser = await user.save();
    return updatedUser;
  }

  public static async delete(id: string): Promise<number> {
    const deletedCount = await UserModel.destroy({ where: { id } });
    return deletedCount;
  }
}
