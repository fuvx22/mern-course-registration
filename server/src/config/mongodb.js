const { MongoClient, ServerApiVersion } = require('mongodb');
const env  = require("./environment")

const uri = env.DATABASE_URI
const DATABASE_NAME = env.DATABASE_NAME

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let databaseInstance = null

const CONNECT_DB = async () => {
  await client.connect()

  databaseInstance = client.db(DATABASE_NAME)
}

const GET_DB = () => {
  if (!databaseInstance) throw new Error('Must connect to database first!')
  return databaseInstance
}

const CLOSE_DB = async () => {
  await client.close()
}

module.exports = {
  CONNECT_DB,
  GET_DB,
  CLOSE_DB
}