import { Collection, Db, MongoClient } from 'mongodb'
import 'dotenv/config'
import User from '~/models/schemas/User.schema'

// Connection URL
const url = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@twitter.bwjqvht.mongodb.net/?retryWrites=true&w=majority`

class DatabaseService {
  private client: MongoClient
  private db: Db

  constructor() {
    this.client = new MongoClient(url)
    this.db = this.client.db(process.env.DB_NAME)
  }

  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('Ping to succesfully')
    } catch (error) {
      console.log(error)
    }
  }

  get users(): Collection<User> {
    return this.db.collection('users')
  }
}

const databaseService = new DatabaseService()
export default databaseService
