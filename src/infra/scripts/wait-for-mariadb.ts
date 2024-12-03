require('dotenv').config();
const { exec } = require('node:child_process');

function checkMariaDB() {
  exec(
    `docker exec mariadb_container mysqladmin ping -u root -p${process.env.MYSQL_ROOT_PASSWORD}`,
    handleReturn
  );

  function handleReturn(error, stdout, stderr) {
    if (stdout.search('mysqld is alive') === -1) {
      process.stdout.write('.');
      checkMariaDB();
      return;
    }
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log('\n✅ MariaDB está pronto e aceitando conexões!\n');
  }
}

process.stdout.write('\n🐦 Aguardando conexão com MariaDB...');
checkMariaDB();
