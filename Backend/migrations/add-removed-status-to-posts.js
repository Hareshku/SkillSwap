import { DataTypes } from 'sequelize';

export const up = async (queryInterface, Sequelize) => {
  // Add 'removed' to the status ENUM
  await queryInterface.changeColumn('posts', 'status', {
    type: DataTypes.ENUM('active', 'paused', 'completed', 'archived', 'removed'),
    defaultValue: 'active',
    allowNull: false
  });
};

export const down = async (queryInterface, Sequelize) => {
  // Remove 'removed' from the status ENUM (revert)
  await queryInterface.changeColumn('posts', 'status', {
    type: DataTypes.ENUM('active', 'paused', 'completed', 'archived'),
    defaultValue: 'active',
    allowNull: false
  });
};