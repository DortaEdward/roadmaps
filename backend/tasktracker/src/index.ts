import { existsSync } from "fs"
import { readFile, writeFile } from "fs/promises"
import path from "path"
import process, { stdin, stdout } from "process"

type Status = "done" | "todo" | "in-progress"

interface Task {
    id: number
    description: string
    status: Status
    createdAt: string
    updatedAt: string
}

function handleError(error: any) {
    if (error instanceof Error) {
        console.error(error.message)
        process.exit(-1)
    }
}

const FILENAME = "tasks.json"
const FILEPATH = path.join(__dirname, FILENAME)

let fileData: Task[] = []
let count: number;

function getStats() {
    count = fileData.length
}

function doesTaskExist(id: number) {
    const task = fileData.find((t) => t.id === id);
    if (task === undefined) {
        throw new Error("Task with that id is not found.")
    }
}

async function openFile() {
    try {
        const exists = await existsSync(FILEPATH)
        if (!exists) {
            return await writeToFile()
        }
        const file = await readFile(FILEPATH, "utf-8");
        const tempData = JSON.parse(file) as Task[]
        tempData.forEach(task => {
            fileData.push(task)
        })
    } catch (error) {
        handleError(error)
    }
}

async function addTask(description: string, status: Status) {
    try {
        const task: Task = {
            id: count + 1,
            description: description,
            status: status,
            createdAt: new Date().toDateString(),
            updatedAt: new Date().toDateString()
        }
        fileData.push(task)
        await writeToFile()
    } catch (error) {
        handleError(error)
    }
}

async function readTasks(status?: Status) {
    switch (status) {
        case "todo":
            fileData.forEach(task => {
                if (task.status === "todo")
                    console.log(`${task.id} | ${task.description} | ${task.status} | ${task.createdAt} | ${task.updatedAt}`)
            })
            break;
        case "in-progress":
            fileData.forEach(task => {
                if (task.status === "in-progress")
                    console.log(`${task.id} | ${task.description} | ${task.status} | ${task.createdAt} | ${task.updatedAt}`)
            })
            break;
        case "done":
            fileData.forEach(task => {
                if (task.status === "done")
                    console.log(`${task.id} | ${task.description} | ${task.status} | ${task.createdAt} | ${task.updatedAt}`)
            })
            break;
        default:
            fileData.forEach(task => {
                console.log(`${task.id} | ${task.description} | ${task.status} | ${task.createdAt} | ${task.updatedAt}`)
            })
    }
}

async function updateTask(id: number, description: string) {
    doesTaskExist(id);
    fileData = fileData.map(t => {
        if (t.id === id) {
            return {
                ...t,
                description: description
            }
        }
        return t
    })
    await writeToFile()
}

async function deleteTask(id: number) {
    doesTaskExist(id);
    fileData = fileData.filter(t => t.id !== id)
    await writeToFile()
    console.log(`Task id :${id} deleted`)
}

async function writeToFile() {
    try {
        await writeFile(FILEPATH, JSON.stringify(fileData))
    } catch (error) {
        handleError(error)
    }
}

async function main() {
    await openFile()
    await getStats()

    await addTask("New task", "done")
    await updateTask(15, "Updated tasks")
    await deleteTask(10);
    await readTasks("done");
}

main()


/*
    for update and delete need to update the file as well
*/