const sequelize = require('sequelize')
/**
 * @typedef UserLibraryItem
 */

const { DataTypes, Model } = sequelize

class UserLibraryItem extends Model {
  constructor(values, options) {
    super(values, options)

    /** @type {string} */
    this.userId
    /** @type {string} */
    this.libId
  }

  /**
   * Initialize model
   * @param {import('../Database').sequelize} sequelize
   */
  static init(sequelize) {
    super.init(
      {
        userId: DataTypes.UUID,
        libId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            // User belongsTo Company 1:1
            model: 'libraryItem',
            key: 'id'
          }
        }
      },
      {
        sequelize,
        modelName: 'userLibraryItem'
      }
    )
    const { libraryItem } = sequelize.models

    libraryItem.hasOne(UserLibraryItem, {
      foreignKey: 'libId',
      constraints: false
    })
    UserLibraryItem.belongsTo(libraryItem, { foreignKey: 'libId', constraints: false })
  }
}

module.exports = UserLibraryItem
