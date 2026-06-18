const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Event name is required' },
      len: { args: [3, 200], msg: 'Event name must be between 3 and 200 characters' },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Description is required' },
    },
  },
  dateTime: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: { msg: 'Must be a valid date' },
    },
  },
  venue: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Venue is required' },
    },
  },
  totalSeats: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'Total seats must be at least 1' },
    },
  },
  availableSeats: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'Available seats cannot be negative' },
    },
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'General',
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('upcoming', 'ongoing', 'completed', 'cancelled'),
    defaultValue: 'upcoming',
  },
});

module.exports = Event;
