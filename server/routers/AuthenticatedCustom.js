const express = require('express')
const AuthenticatedCustomController = require('../controllers/AuthenticatedCustomController')
const LibraryController = require('../controllers/LibraryController')

class AuthenticatedCustom {
  constructor(Server) {
    this.auth = Server.auth
    this.router = express()
    this.router.disable('x-powered-by')
    this.init()
  }

  init() {
    this.router.post('/assign-audiobook', AuthenticatedCustomController.assignLibraryToUsers.bind(this))
    this.router.get('/libraries/:id/items', LibraryController.middleware.bind(this), AuthenticatedCustomController.getLibraryUserItems.bind(this))
    this.router.get('/assign-audiobook', AuthenticatedCustomController.getAssignUsersLibraryIds.bind(this))
    this.router.post('/assign-collection', AuthenticatedCustomController.assignCollectionToUsers.bind(this))
    this.router.get('/assign-collection', AuthenticatedCustomController.getAssignUsersCollectionIds.bind(this))
    this.router.post('/assign-playlist', AuthenticatedCustomController.assignPlaylistToUsers.bind(this))
    this.router.get('/assign-playlist', AuthenticatedCustomController.getAssignUsersPlaylistIds.bind(this))
  }
}
module.exports = AuthenticatedCustom
