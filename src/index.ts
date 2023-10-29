import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'

const port = 3000
const app = express()

databaseService.connect()

app.use(express.json())
app.use('/users', usersRouter)
app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Listening on port: ${port}`)
})
