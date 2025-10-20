
import { prisma } from './db';

console.log('\x1b[36mChemin courant :\x1b[0m', process.cwd());
console.log('\x1b[33mDATABASE_URL détectée :\x1b[0m', process.env.DATABASE_URL);

async function checkDb() {
  try {
    // Vérifier la connexion
    await prisma.$connect();
    console.log('\x1b[32m✅ Connexion à la base de données réussie.\x1b[0m');

    // Récupérer les tables
    const tablesRes = await prisma.$queryRawUnsafe("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'");
    const tables = Array.isArray(tablesRes) ? tablesRes : [];
    if (tables.length === 0) {
      console.log('\x1b[36mℹ️ Aucune table trouvée dans le schéma public.\x1b[0m');
    } else {
      console.log('\x1b[33mTables disponibles :\x1b[0m');
      for (const t of tables) {
        // Compter les lignes
        const countRes = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS count FROM "${t.table_name}"`);
        const count = Array.isArray(countRes) && countRes[0]?.count !== undefined ? countRes[0].count : 0;
        console.log(`\x1b[36m- ${t.table_name}\x1b[0m : \x1b[35m${count} lignes\x1b[0m`);
      }
    }
  } catch (err) {
    const error = err as Error & { code?: string, message?: string };
    console.error('\x1b[31m❌ Erreur lors de la vérification de la base de données :\x1b[0m', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkDb();
