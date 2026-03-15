import { Client, Account, Avatars } from "react-native-appwrite";

export const client = new Client()
  .setEndpoint("https://nyc.cloud.appwrite.io/v1")
  .setProject("6993cfe80002266cb47d") // Replace with your project ID
  .setPlatform('com.netninja.shelfie');

export const account = new Account(client);
export const avatars = new Avatars(client);
//export const tablesDB = new TablesDB(client);
