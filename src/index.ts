import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'

const port = 3000
const app = express()

app.use(express.json())
app.use('/user', usersRouter)
databaseService.connect()

app.listen(port, () => {
  console.log(`Listening on port: ${port}`)
})
