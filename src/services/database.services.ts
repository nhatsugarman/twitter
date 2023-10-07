import { MongoClient } from 'mongodb'

// Connection URL
const url = 'mongodb+srv://nhatsugarman:A123456789a@twitter.bwjqvht.mongodb.net/?retryWrites=true&w=majority'

class DatabaseService {
  private client: MongoClient

  constructor() {
    this.client = new MongoClient(url)
  }

  async connect() {
    try {
      console.log('Connected successfully to server')
      await this.client.db('admin').command({ ping: 1 })
      console.log('Ping to succesfully')
    } finally {
      await this.client.close()
    }
  }
}

const databaseService = new DatabaseService()
export default databaseService
