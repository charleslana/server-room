import database from 'database';
import UserModel from './UserModel';
import UserRoleEnum from 'enum/UserRoleEnum';
import { DataTypes, Model, Sequelize } from 'sequelize';

export default class UserRoleModel extends Model {
  public id!: string;
  public name!: UserRoleEnum;
  public userId!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

UserRoleModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.ENUM(...Object.values(UserRoleEnum)),
      allowNull: false,
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      onDelete: 'CASCADE',
      references: {
        model: UserModel,
        key: 'id',
      },
      field: 'user_id',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'updated_at',
    },
  },
  {
    sequelize: database,
    tableName: 'tb_user_role',
    freezeTableName: true,
    timestamps: true,
    updatedAt: true,
  }
);
