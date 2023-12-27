import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/database';
import bcrypt from 'bcrypt';

class User extends Model {
    public id!: number;
    public name!: string;
    public email!: string;
    public password!: string;
    public readonly creationDate!: Date;
    public updateDate!: Date;

    public async hashPassword() {
        this.password = await bcrypt.hash(this.password, 10);
    }
}

User.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: new DataTypes.STRING(128),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: new DataTypes.STRING(256),
        allowNull: false,
    },
    creationDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },
    updateDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    }
}, {
    sequelize,
    modelName: 'user',
    timestamps: false
});

export default User;
