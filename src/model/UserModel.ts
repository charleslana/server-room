import database from 'database';
import UserRoleModel from './UserRoleModel';
import { DataTypes, HasManyGetAssociationsMixin, Model, Sequelize } from 'sequelize';

export default class UserModel extends Model {
  public id!: string;
  public authToken!: string | null;
  public username!: string;
  public password!: string;
  public banned!: Date | null;
  public match!: number;
  public victory!: number;
  public defeat!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
  public readonly roles!: UserRoleModel[];
  public getRoles!: HasManyGetAssociationsMixin<UserRoleModel>;
}

UserModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    authToken: {
      type: DataTypes.STRING(100),
      field: 'auth_token',
    },
    username: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    banned: {
      type: DataTypes.DATE,
    },
    match: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    victory: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    defeat: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
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
    tableName: 'tb_user',
    freezeTableName: true,
    timestamps: true,
    updatedAt: true,
  }
);

UserModel.hasMany(UserRoleModel, { as: 'roles', foreignKey: 'userId' });
