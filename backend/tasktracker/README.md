# Project 1
## Task Tracker
Build a CLI app to track your tasks and manage your to-do list.

Task Tracker is a project used to track and manage your tasks. In this task, you build a simple command line interface (CLI) to track what you need to do, what you have done, and what you are currently working on. This project will help you practice your programming skills, including working with the filesystem, handling user inputs, and building a simple CLI application.


## Requirements
The application should run from the command line, accept user actions and inputs as arguments, and store the tasks in a JSON file. The user should be able to:
* Add, Update, and Delete tasks
* Mark a task as in progress or done
* List all tasks
* List all tasks that are done
* List all tasks that are not done
* List all tasks that are in progress

### Here are some constraints to guide the implementation:
* You can only use any programming language to build this project
* Use positional arguments in command line to accept user inputs
* Use a JSON file to store the tasks in the current directory
* The JSON file should be created if it does not exist
* Use the native file system module of your programming language to interact with the JSON file
* Do not use any external libraries or frameworks to build this project
* Ensure to handle errors and edge cases gracefully

### Task Properties
- id
- descriptions
- status
- createdAt
- updatedAt

List of commands
- task-cli add "Buy groceries"
  # Output: Task added successfully (ID:1)


- task-cli update 1 "Buy groceries and cook dinner"
- task-cli delete 1

- task-cli mark-in-progress 1
- task-cli mark-done 1

- task-cli list

- task-cli list done
- task-cli list todo
- task-cli list in-progress 
