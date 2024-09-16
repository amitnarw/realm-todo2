
import app, { getMongoClient } from "./realmConfig"; // Import app
import React, { useState, useEffect } from 'react';
import { getTodos, addTodoToIDB, deleteTodo as deleteTodoFromIDB } from './idbUtils';

const TodoApp = () => {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState('');
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        fetchTodos();
        window.addEventListener('online', syncTodos);
        window.addEventListener('offline', () => setIsOnline(false));

        return () => {
            window.removeEventListener('online', syncTodos);
            window.removeEventListener('offline', () => setIsOnline(false));
        };
    }, []);

    const fetchTodos = async () => {
        if (navigator.onLine) {
            try {
                const mongo = await getMongoClient();
                const collection = mongo.db("todo").collection("Item");
                const items = await collection.find();
                setTodos(items);
            } catch (error) {
                console.error("Failed to fetch todos:", error);
            }
        } else {
            const offlineTodos = await getTodos();
            setTodos(offlineTodos);
        }
    };

    const addTodo = async () => {
        const newItem = {
            text: newTodo,
            done: false,
            owner_id: app.currentUser.id,
            summary: "Sample summary",
            isComplete: false,
            _id: new Date().toISOString()
        };

        if (navigator.onLine) {
            try {
                const mongo = await getMongoClient();
                const collection = mongo.db("todo").collection("Item");
                await collection.insertOne(newItem);
                setTodos([...todos, newItem]);
            } catch (error) {
                console.error("Failed to add todo:", error);
            }
        } else {
            await addTodoToIDB(newItem);
            setTodos([...todos, newItem]);
        }

        setNewTodo('');
    };

    const syncTodos = async () => {
        setIsOnline(true);
        const offlineTodos = await getTodos();

        try {
            const mongo = await getMongoClient();
            const collection = mongo.db("todo").collection("Item");

            for (const todo of offlineTodos) {
                await collection.insertOne(todo);
                await deleteTodoFromIDB(todo._id);
            }

            fetchTodos(); // Refresh todos from MongoDB after syncing
        } catch (error) {
            console.error("Failed to sync todos:", error);
        }
    };

    const updateTodo = async (id, done) => {
        try {
            const mongo = await getMongoClient();
            const collection = mongo.db("todo").collection("Item");
            await collection.updateOne({ _id: id }, { $set: { done } });
            setTodos(todos.map(todo => todo._id === id ? { ...todo, done } : todo));
        } catch (error) {
            console.error("Failed to update todo:", error);
        }
    };

    const deleteTodo = async (id) => {
        try {
            const mongo = await getMongoClient();
            const collection = mongo.db("todo").collection("Item");
            await collection.deleteOne({ _id: id });
            setTodos(todos.filter(todo => todo._id !== id));
        } catch (error) {
            console.error("Failed to delete todo:", error);
        }
    };

    return (
        <div>
            <h1>Todo App</h1>
            <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Enter new todo"
            />
            <button onClick={addTodo}>Add Todo</button>
            <ul>
                {todos.map(todo => (
                    <li key={todo._id}>
                        <input
                            type="checkbox"
                            checked={todo.done}
                            onChange={(e) => updateTodo(todo._id, e.target.checked)}
                        />
                        {todo.text}
                        <button onClick={() => deleteTodo(todo._id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TodoApp;
