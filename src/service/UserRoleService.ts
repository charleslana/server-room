import UserRoleEnum from 'enum/UserRoleEnum';
import { UserRoleRepository } from 'repository/UserRoleRepository';

export class UserRoleService {
  private constructor() {}

  public static async create(userId: string, roleName: UserRoleEnum): Promise<void> {
    await UserRoleRepository.save(userId, roleName);
  }
}
