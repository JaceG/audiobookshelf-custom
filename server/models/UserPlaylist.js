const sequelize = require('sequelize')
/**
 * @typedef UserLibraryItem
 */

const { DataTypes, Model } = sequelize

class UserPlaylist extends Model {
  constructor(values, options) {
    super(values, options)

    /** @type {string} */
    this.userId
    /** @type {string} */
    this.playlistId
  }

  /**
   * Initialize model
   * @param {import('../Database').sequelize} sequelize
   */
  static init(sequelize) {
    super.init(
      {
        userId: DataTypes.UUID,
        playlistId: {
          type: DataTypes.UUID,
          allowNull: false
        }
      },
      {
        sequelize,
        modelName: 'userPlaylist'
      }
    )
  }
}

module.exports = UserPlaylist
