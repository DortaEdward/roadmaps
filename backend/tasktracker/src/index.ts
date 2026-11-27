import { existsSync, readFileSync } from "fs"
import { writeFile } from "fs/promises"
import path from "path"
import process from "process"

type Status = "done" | "todo" | "in-progress"

function isStatus(value: string): value is Status {
    return ["done", "todo", "in-progress"].includes(value);
}


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
        // check if file is empty
        if (!exists) {
            return await writeToFile()
        }
        const file = await readFileSync(FILEPATH, "utf-8");
        if (file.length === 0) {
            fileData = []
        } else {
            const tempData = JSON.parse(file) as Task[]
            tempData.forEach(task => {
                fileData.push(task)
            })
        }
    } catch (error) {
        handleError(error)
    }
}

async function addTask(description: string) {
    try {
        const task: Task = {
            id: count + 1,
            description: description,
            status: "todo",
            createdAt: new Date().toDateString(),
            updatedAt: new Date().toDateString()
        }
        fileData.push(task)
        await writeToFile()
    } catch (error) {
        handleError(error)
    }
}

async function listTasks(status?: Status) {
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

async function mark(id: number, status: Status) {
    doesTaskExist(id)
    let task = fileData.find(t => t.id === id)
    if (task === undefined) {
        throw new Error("Task does not exists")
    }
    task.status = status
    fileData = fileData.map((t) => {
        if (t.id === id) {
            return task
        }
        return t;
    })
    await writeToFile();
}



async function main() {
    const args = process.argv;
    if (args.length <= 2) {
        console.error("ERROR: Missing arguments. Type -help for more details")
        process.exit(-1);
    }

    await openFile()
    await getStats()

    let arg = args.slice(2)

    switch (arg[0]) {
        case "add":
            if (!arg[1]) {
                console.error(`ERROR: Missing argument "Description", please try again.`)
                process.exit(-1)
            }
            await addTask(arg[1])
            break;
        case "update":
            if (!arg[1]) {
                console.error(`ERROR: Missing argument "ID", please try again.`)
                process.exit(-1)
            }
            if (!Number(arg[1])) {
                console.error(`ERROR: argument "ID" is not a number, please try again.`)
                process.exit(-1)
            }
            if (!arg[2]) {
                console.error(`ERROR: Missing argument "Description", please try again.`)
                process.exit(-1)
            }
            await updateTask(Number(arg[1]), arg[2])
            break;
        case "delete":
            if (!arg[1]) {
                console.error(`ERROR: Missing argument "ID", please try again.`)
                process.exit(-1)
            }
            if (!Number(arg[1])) {
                console.error(`ERROR: argument "ID" is not a number, please try again.`)
                process.exit(-1)
            }
            await deleteTask(Number(arg[1]))
            break;
        case "mark-todo":
            if (!arg[1]) {
                console.error(`ERROR: Missing argument "ID", please try again.`)
                process.exit(-1)
            }
            await mark(Number(arg[1]), "todo")
            break;
        case "mark-in-progress":
            if (!arg[1]) {
                console.error(`ERROR: Missing argument "ID", please try again.`)
                process.exit(-1)
            }
            await mark(Number(arg[1]), "in-progress")
            break;
        case "mark-done":
            if (!arg[1]) {
                console.error(`ERROR: Missing argument "ID", please try again.`)
                process.exit(-1)
            }
            await mark(Number(arg[1]), "done")
            break;
        case "list":
            if (!arg[1]) {
                await listTasks()
                return;
            }
            if (!isStatus(arg[1])) {
                console.error(`ERROR: Missing argument "Status", please try again.`)
                process.exit(-1)
            }
            await listTasks(arg[1])
            break;
    }
}

main()
