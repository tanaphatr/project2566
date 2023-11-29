const sql = require('mssql');

const config = ({
    user: 'admin',
    password: 'password',
    server: 'LAPTOP-369163PM',
    database: 'MusslementorDB',
    driver: 'msnodesqlv8',
    options: {
      encrypt: true,
      trustServerCertificate: true, 
    },
})

const pool = new sql.ConnectionPool(config);

pool.connect((err) => {
  if (err) {
    console.log('error connecting', err);
    return;
  }
  console.log('Connected to the database');
  pool.close();
});

module.exports = {
  query: async (text) => {
    try {
      await pool.connect();
      const result = await pool.request().query(text);
      return result.recordset;
    } catch (err) {
      console.error('Error executing query:', err);
      throw err; // Make sure to propagate the error
    }
  },
};
