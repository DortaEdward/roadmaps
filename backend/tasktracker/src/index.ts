import { existsSync, readFileSync } from "fs"
import { writeFile } from "fs/promises"
import path from "path"
import process from "process"

type Status = "done" | "todo" | "in-progress"

function isStatus(value: string): value is Status {
    return ["done", "todo", "in-progress"].includes(value);
}

const HELP_TEXT = `Usage: task-cli <command> [arguments]

Commands:
  add <description>             Add a new task
  update <id> <description>     Change a task's description
  delete <id>                   Delete a task
  mark-todo <id>                Mark a task as todo
  mark-in-progress <id>         Mark a task as in progress
  mark-done <id>                Mark a task as done
  list [status]                 List all tasks, or only those with a status
                                (status: todo, in-progress, done)
  help                          Show this message

Examples:
  task-cli add "Buy groceries"
  task-cli update 1 "Buy groceries and cook dinner"
  task-cli mark-done 1
  task-cli list in-progress`;

interface Task {
    id: number
    description: string
    status: Status
    createdAt: string
    updatedAt: string
}

function handleError(error: unknown): never {
    if (error instanceof Error) {
        console.error(error.message)
    } else {
        console.error(error)
    }
    process.exit(1)
}

const FILENAME = "tasks.json"
const FILEPATH = path.join(__dirname, FILENAME)

let fileData: Task[] = []


async function openFile() {
    try {
        const exists = await existsSync(FILEPATH)
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
function createTimeStamp() {
    return new Date().toISOString();
}

function generateID() {
    return fileData.reduce((max, t) => Math.max(max, t.id), 0) + 1;
}

async function addTask(description: string) {
    try {
        const time = createTimeStamp()
        const task: Task = {
            id: generateID(),
            description: description,
            status: "todo",
            createdAt: time,
            updatedAt: time
        }
        fileData.push(task)
        await writeToFile()
    } catch (error) {
        handleError(error)
    }
}

async function listTasks(status?: Status) {
    const filteredList = status ?
        fileData.filter(t => t.status === status)
        : fileData
    if (filteredList.length === 0) {
        console.log("No tasks found.")
        return
    }
    filteredList.forEach(task => {
        console.log(`${task.id} | ${task.description} | ${task.status} | ${task.createdAt} | ${task.updatedAt}`)
    })
}

async function updateTask(id: number, description: string) {
    findTask(id);
    fileData = fileData.map(t => {
        if (t.id === id) {
            return {
                ...t,
                description: description,
                updatedAt: createTimeStamp()
            }
        }
        return t
    })
    await writeToFile()
}

async function deleteTask(id: number) {
    findTask(id);
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

function findTask(id: number) {
    const task = fileData.find(t => t.id === id)
    if (task === undefined) {
        handleError("ERROR: Task does not exist. Try again.");
    }
    return task
}

async function mark(id: number, status: Status) {
    let task = findTask(id)
    task.status = status
    task.updatedAt = createTimeStamp()
    await writeToFile();
}

function parseId(value: string | undefined) {
    if (!value) handleError(`ERROR: Missing argument "ID", please try again.`)
    const id = Number(value)
    if (!Number.isInteger(id) || id <= 0) handleError(`ERROR: argument "ID" is not a number, please try again.`)
}

function printHelp() {
    console.log(HELP_TEXT)
    return
}


async function main() {
    const args = process.argv;

    let arg = args.slice(2)
    if (arg.length === 0 || /^-{0,2}(h|help)$/i.test(arg[0])) {
        printHelp()
        return
    }

    await openFile()

    switch (arg[0]) {
        case "add":
            if (!arg[1]) handleError(`ERROR: Missing argument "Description", please try again.`)
            await addTask(arg[1])
            break;
        case "update":
            parseId(arg[1]);
            if (!arg[2]) handleError(`ERROR: Missing argument "Description", please try again.`)
            await updateTask(Number(arg[1]), arg[2])
            break;
        case "delete":
            parseId(arg[1]);
            await deleteTask(Number(arg[1]))
            break;
        case "mark-todo":
            parseId(arg[1]);
            await mark(Number(arg[1]), "todo")
            break;
        case "mark-in-progress":
            parseId(arg[1]);
            await mark(Number(arg[1]), "in-progress")
            break;
        case "mark-done":
            parseId(arg[1]);
            await mark(Number(arg[1]), "done")
            break;
        case "list":
            if (!arg[1]) {
                await listTasks()
                return;
            }
            if (!isStatus(arg[1])) {
                console.error(`ERROR: Invalid argument, please try again.`)
                process.exit(1)
            }
            await listTasks(arg[1])
            break;
        default:
            console.error("Invalid command. Enter -help for a list of commands")
            process.exit(1)
    }
}

main()