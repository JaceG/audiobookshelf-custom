const sequelize = require('sequelize')
/**
 * @typedef UserLibraryItem
 */

const { DataTypes, Model } = sequelize

class UserCollection extends Model {
  constructor(values, options) {
    super(values, options)

    /** @type {string} */
    this.userId
    /** @type {string} */
    this.collectionId
  }

  /**
   * Initialize model
   * @param {import('../Database').sequelize} sequelize
   */
  static init(sequelize) {
    super.init(
      {
        userId: DataTypes.UUID,
        collectionId: {
          type: DataTypes.UUID,
          allowNull: false
        }
      },
      {
        sequelize,
        modelName: 'userCollection'
      }
    )
  }
}

module.exports = UserCollection
