import UserRoleEnum from 'enum/UserRoleEnum';
import UserRoleModel from 'model/UserRoleModel';

export class UserRoleRepository {
  private constructor() {}

  public static async save(userId: string, roleName: UserRoleEnum): Promise<void> {
    await UserRoleModel.create({ userId, name: roleName });
  }
}
