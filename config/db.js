var mongoose = require('mongoose');
require('dotenv').config()

module.exports = {
  connectDB: async () => {
    try {
      //database Name
      const databaseName = process.env.DB_DEV;
      const con = await mongoose.connect(`mongodb://127.0.0.1:27017/${databaseName}`, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        useCreateIndex: true
      });
      console.log(`Database connected : ${con.connection.host}`)
    } catch (error) {
      console.error(`Error: ${error.message}`)
      process.exit(1)
    }
  },

  disconnectDB: () => {
    mongoose.disconnect();
  }
}