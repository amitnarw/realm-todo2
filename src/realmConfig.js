import * as Realm from "realm-web";

const app = new Realm.App({ id: "application-1-qbwpyyy" });

export const getMongoClient = async () => {
    if (!app.currentUser) {
        // const credentials = Realm.Credentials.apiKey("your-api-key");
        const credentials = Realm.Credentials.apiKey("9yn4hDbBczip84iqfu3AxygKkcaphWZIALyX5yT37C9jbMaD1JUBQQZY6BLqUhzq");
        await app.logIn(credentials);
    }
    return app.currentUser.mongoClient("mongodb-atlas");
};

export default app;