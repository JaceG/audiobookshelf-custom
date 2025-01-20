const express = require('express')
const PublicCustomController = require('../controllers/PublicCustomController')

class PublicCustom {
  constructor(Server) {
    this.auth = Server.auth
    this.router = express()
    this.router.disable('x-powered-by')
    this.init()
  }

  init() {
    this.router.post('/register', PublicCustomController.register.bind(this))
  }
}
module.exports = PublicCustom
