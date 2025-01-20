const Logger = require('../Logger')
const Database = require('../Database')
const uuidv4 = require('uuid').v4
const libraryFilters = require('../utils/queries/libraryFilters')

class AuthenticatedCustomController {
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

  async assignLibraryToUsers(req, res) {
    const userId = req.user.id
    const libId = req.body.libId

    if (!libId) {
      return res.status(400).send('library is required')
    }

    const dublicateItem = await Database.models.userLibraryItem.findOne({ where: { userId, libId } })

    if (dublicateItem) {
      return res.status(400).send('You have already added this audiobook to personal profile')
    }
    // Create library with libraryFolders
    const library = await Database.models.userLibraryItem
      .create({
        userId,
        libId
      })
      .catch((error) => {
        Logger.error(`[AuthenticatedCustomController] Failed to assign library to user "${libId}"`, error)
      })
    if (!library) {
      return res.status(500).send('Failed to assign audiobook')
    }
    res.json({
      message: 'Audiobook assigned to personal profile'
    })
  }

  async assignCollectionToUsers(req, res) {
    const userId = req.user.id
    const collectionId = req.body.collectionId

    if (!collectionId) {
      return res.status(400).send('collection is required')
    }

    const dublicateItem = await Database.models.userCollection.findOne({ where: { userId, collectionId } })

    if (dublicateItem) {
      return res.status(400).send('You have already added this collection personal profile')
    }
    // Create library with libraryFolders
    const library = await Database.models.userCollection
      .create({
        userId,
        collectionId
      })
      .catch((error) => {
        Logger.error(`[AuthenticatedCustomController] Failed to assign library to user "${collectionId}"`, error)
      })
    if (!library) {
      return res.status(500).send('Failed to assign collection')
    }
    res.json({
      message: 'Collection assigned to personal profile'
    })
  }

  async assignPlaylistToUsers(req, res) {
    const userId = req.user.id
    const playlistId = req.body.playlistId

    if (!playlistId) {
      return res.status(400).send('playlist is required')
    }

    const dublicateItem = await Database.models.userPlaylist.findOne({ where: { userId, playlistId } })

    if (dublicateItem) {
      return res.status(400).send('You have already added this playlistId personal profile')
    }
    // Create library with libraryFolders
    const library = await Database.models.userPlaylist
      .create({
        userId,
        playlistId
      })
      .catch((error) => {
        Logger.error(`[AuthenticatedCustomController] Failed to assign playlistId to user "${playlistId}"`, error)
      })
    if (!library) {
      return res.status(500).send('Failed to assign collection')
    }
    res.json({
      message: 'Playlist assigned to personal profile'
    })
  }

  async getLibraryUserItems(req, res) {
    const include = (req.query.include || '')
      .split(',')
      .map((v) => v.trim().toLowerCase())
      .filter((v) => !!v)

    const payload = {
      results: [],
      total: undefined,
      limit: req.query.limit || 0,
      page: req.query.page || 0,
      sortBy: req.query.sort,
      sortDesc: req.query.desc === '1',
      filterBy: req.query.filter,
      mediaType: req.library.mediaType,
      minified: req.query.minified === '1',
      collapseseries: req.query.collapseseries === '1',
      include: include.join(',')
    }

    payload.offset = payload.page * payload.limit

    // TODO: Temporary way of handling collapse sub-series. Either remove feature or handle through sql queries
    const filterByGroup = payload.filterBy?.split('.').shift()
    //    const userPlaylist = await Database.libraryItemModel.where('userId', req.user.id)
    //  console.log({ userPlaylist })
    const filterByValue = filterByGroup ? libraryFilters.decode(payload.filterBy.replace(`${filterByGroup}.`, '')) : null
    if (filterByGroup === 'series' && filterByValue !== 'no-series' && payload.collapseseries) {
      const seriesId = libraryFilters.decode(payload.filterBy.split('.')[1])
      payload.results = await libraryHelpers.handleCollapseSubseries(payload, seriesId, req.user, req.library, true)
    } else {
      const { libraryItems, count } = await Database.libraryItemModel.getByFilterAndSort(req.library, req.user, payload, true)
      payload.results = libraryItems
      payload.total = count
    }

    res.json(payload)
  }

  async getAssignUsersLibraryIds(req, res) {
    const userId = req.user.id
    const userAssignedItems = await Database.userLibraryItemModel.findAll({ where: { userId } })
    res.json({
      data: userAssignedItems,
      message: 'Audiobook assigned items listed successfully'
    })
  }

  async getAssignUsersCollectionIds(req, res) {
    const userId = req.user.id
    const userAssignedCollections = await Database.userCollection.findAll({ where: { userId } })
    res.json({
      data: userAssignedCollections,
      message: 'Assigned collections listed successfully'
    })
  }

  async getAssignUsersPlaylistIds(req, res) {
    const userId = req.user.id
    const userAssignedPlaylist = await Database.userPlaylist.findAll({ where: { userId } })
    res.json({
      data: userAssignedPlaylist,
      message: 'Assigned playlist listed successfully'
    })
  }
}
module.exports = new AuthenticatedCustomController()
