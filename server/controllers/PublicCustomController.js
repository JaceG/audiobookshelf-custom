const Logger = require('../Logger')
const Database = require('../Database')
const uuidv4 = require('uuid').v4

class PublicCustomController {
  constructor() {}

  /**
   * POST: /public/custom/register
   * Register user
   *
   * @this {import('../routers/ApiRouter')}
   *
   * @param {RequestWithUser} req
   * @param {Response} res
   */

  async register(req, res) {
    if (!req.body.username || !req.body.password || typeof req.body.username !== 'string' || typeof req.body.password !== 'string') {
      return res.status(400).send('Username and password are required')
    }
    if (req.body.type && !Database.userModel.accountTypes.includes(req.body.type)) {
      return res.status(400).send('Invalid account type')
    }

    const usernameExists = await Database.userModel.checkUserExistsWithUsername(req.body.username)
    if (usernameExists) {
      return res.status(400).send('Username already taken')
    }
    const emailExists = await Database.userModel.checkUserExistsWithEmail(req.body.email)
    if (emailExists) {
      return res.status(400).send('Email already taken')
    }
    if (req.body.friend?.toLowerCase() !== 'jace') {
      return res.status(400).send('User not found')
    }
    const userId = uuidv4()
    const pash = await this.auth.hashPass(req.body.password)
    const token = await this.auth.generateAccessToken({ id: userId, username: req.body.username })
    const userType = req.body.type || 'user'

    // librariesAccessible and itemTagsSelected can be on req.body or req.body.permissions
    // Old model stored them outside of permissions, new model stores them inside permissions
    let reqLibrariesAccessible = req.body.librariesAccessible || req.body.permissions?.librariesAccessible
    if (reqLibrariesAccessible && (!Array.isArray(reqLibrariesAccessible) || reqLibrariesAccessible.some((libId) => typeof libId !== 'string'))) {
      Logger.warn('[UserController] create: Invalid librariesAccessible value: ${reqLibrariesAccessible}')
      reqLibrariesAccessible = null
    }
    let reqItemTagsSelected = req.body.itemTagsSelected || req.body.permissions?.itemTagsSelected
    if (reqItemTagsSelected && (!Array.isArray(reqItemTagsSelected) || reqItemTagsSelected.some((tagId) => typeof tagId !== 'string'))) {
      Logger.warn('[UserController] create: Invalid itemTagsSelected value: ${reqItemTagsSelected}')
      reqItemTagsSelected = null
    }
    if (req.body.permissions?.itemTagsSelected || req.body.permissions?.librariesAccessible) {
      delete req.body.permissions.itemTagsSelected
      delete req.body.permissions.librariesAccessible
    }

    // Map permissions
    const permissions = Database.userModel.getDefaultPermissionsForUserType(userType)
    if (req.body.permissions && typeof req.body.permissions === 'object') {
      for (const key in req.body.permissions) {
        if (permissions[key] !== undefined) {
          if (typeof req.body.permissions[key] !== 'boolean') {
            Logger.warn('[UserController] create: Invalid permission value for key ${key}. Should be boolean')
          } else {
            permissions[key] = req.body.permissions[key]
          }
        } else {
          Logger.warn('[UserController] create: Invalid permission key: ${key}')
        }
      }
    }

    permissions.itemTagsSelected = reqItemTagsSelected || []
    permissions.librariesAccessible = reqLibrariesAccessible || []

    const newUser = {
      id: userId,
      type: userType,
      username: req.body.username,
      email: typeof req.body.email === 'string' ? req.body.email : null,
      pash,
      token,
      isActive: !!req.body.isActive,
      permissions,
      bookmarks: [],
      extraData: {
        seriesHideFromContinueListening: []
      }
    }
    const user = await Database.userModel.create(newUser)
    if (user) {
      res.json({
        user: user.toOldJSONForBrowser()
      })
    } else {
      return res.status(500).send('Failed to save new user')
    }
  }
}
module.exports = new PublicCustomController()
