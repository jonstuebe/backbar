import { program } from "commander";
import path from "node:path";
import { readFile, readdir } from "node:fs/promises";
import { config } from "dotenv";
import { initializeApp, cert } from "firebase-admin/app";
import { Timestamp } from "firebase-admin/firestore";
import { getFirestore } from "firebase-admin/firestore";
import { createSpinner } from "nanospinner";
import inquirer from "inquirer";
import { isObject } from "lodash";
import { PromisePool } from "@supercharge/promise-pool";

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
  auth_provider_x509_cert_url:
    process.env.FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_X509_CERT_URL,
};

function transformRecord(record: Record<string, any>) {
  if (record) {
    const keys = Object.keys(record);

    return keys.reduce((acc, key) => {
      if (
        record[key] &&
        record[key]["_seconds"] &&
        record[key]["_nanoseconds"]
      ) {
        record[key] = new Timestamp(
          record[key]["_seconds"],
          record[key]["_nanoseconds"]
        );
      }

      if (Array.isArray(record[key])) {
        const arr = (record[key] as any[]).map((arrRecord) => {
          if (isObject(arrRecord)) {
            return transformRecord(arrRecord);
          }
          return arrRecord;
        }) as any;

        return {
          ...acc,
          [key]: arr,
        };
      }

      return {
        ...acc,
        [key]: record[key],
      };
    }, {});
  }

  return record;
}

(async () => {
  const backupsPath = path.join(process.cwd(), "backups", env);
  const spinner = createSpinner("Removing old records");

  try {
    spinner.start();

    const app = initializeApp({
      credential: cert(serviceAccount as any),
      databaseURL,
    });
    const db = getFirestore(app);

    const collections = await db.listCollections();

    for (const collection of collections) {
      const docs = (await collection.get()).docs;

      await PromisePool.withConcurrency(10)
        .for(docs)
        .process(async (doc) => {
          await doc.ref.delete();
        });
    }
    spinner.success({
      text: "Removed old records",
    });

    const dates = await readdir(backupsPath);

    const { dateChosen } = await inquirer.prompt([
      {
        name: "dateChosen",
        type: "list",
        message: "Choose a date",
        choices: dates.map((d) => ({ name: d, value: d })),
      },
    ]);

    const collectionsBackup = (
      await readdir(path.join(backupsPath, dateChosen))
    ).filter((f) => f.endsWith(".json"));

    const restoreSpinner = createSpinner("Restoring records...");

    restoreSpinner.start();
    for (const collectionBackupName of collectionsBackup) {
      const name = collectionBackupName.replace(".json", "");
      const collection = JSON.parse(
        await readFile(
          path.join(backupsPath, dateChosen, collectionBackupName),
          "utf8"
        )
      );

      await PromisePool.withConcurrency(10)
        .for(Object.keys(collection))
        .process(async (key) => {
          await db
            .doc(`${name}/${key}`)
            .create(transformRecord(collection[key]));
        });
    }
    restoreSpinner.success({
      text: "Records restored",
    });
  } catch (e) {
    spinner.error({
      text: (e as any).message,
    });
  }
})();
