import { openDB } from 'idb';

const DB_NAME = 'todo-app-db';
const STORE_NAME = 'todos';

export const initDB = async () => {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            db.createObjectStore(STORE_NAME, { keyPath: '_id' });
        },
    });
};

export const getTodos = async () => {
    const db = await initDB();
    return db.getAll(STORE_NAME);
};

export const addTodoToIDB = async (todo) => {
    const db = await initDB();
    return db.put(STORE_NAME, todo);
};

export const deleteTodo = async (id) => {
    const db = await initDB();
    return db.delete(STORE_NAME, id);
};
