import { program } from "commander";
import path from "node:path";
import { writeFile, mkdir, rm, access } from "node:fs/promises";
import { config } from "dotenv";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { createSpinner } from "nanospinner";

program.version("0.1.0").option("-e, --env <name>", "environment").parse();

const options = program.opts();

const { env } = options;

config({
  path: path.join(process.cwd(), `.env.${env}`),
});

const databaseURL = process.env.FIREBASE_ADMIN_DATABASE_URL;
const serviceAccount = {
  type: process.env.FIREBASE_ADMIN_TYPE,
  project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
  private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
  client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
  auth_uri: process.env.FIREBASE_ADMIN_AUTH_URI,
  token_uri: process.env.FIREBASE_ADMIN_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_X509_CERT_URL,
};

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

(async () => {
  const dateStr = new Date().toISOString().substring(0, 10);
  const backupsPath = path.join(process.cwd(), "backups", env, dateStr);
  const spinner = createSpinner("Backing up data");

  spinner.start();

  try {
    const app = initializeApp({
      credential: cert(serviceAccount as any),
      databaseURL,
    });
    const db = getFirestore(app);

    const collections = await db.listCollections();

    if (await exists(path.join(backupsPath))) {
      await rm(path.join(backupsPath), { recursive: true });
    }
    await mkdir(path.join(backupsPath), { recursive: true });

    for (const collection of collections) {
      const name = collection.id;
      const snapshot = await collection.get();
      const documents: Record<string, any> = {};

      for (const doc of snapshot.docs) {
        documents[doc.id] = doc.data();
      }

      await writeFile(
        path.join(backupsPath, `${name}.json`),
        JSON.stringify(documents, null, 2),
        "utf8"
      );
    }

    spinner.success({
      text: "Backed up data",
    });
  } catch (e: any) {
    spinner.error({
      text: e.message,
    });
  }
})();
