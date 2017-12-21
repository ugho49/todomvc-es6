import {Todo} from "./todo";
import {Store} from "./store";

export class Controller {

    constructor() {
        this.store = new Store(() => this.refreshCounterAndList());
        this.getElements();
        this.addListenners();
        this.initList();
    }

    getElements() {
        this.mainSection = document.querySelector('.main');
        this.newTodoInput = document.querySelector('.new-todo');
        this.todoList = document.querySelector('.todo-list');
        this.btnClearCompleted = document.querySelector('.clear-completed');
        this.btnFilterAll = document.querySelector('.filter-all');
        this.btnFilterActive = document.querySelector('.filter-active');
        this.btnFilterCompleted = document.querySelector('.filter-completed');
        this.itemLeft = document.querySelector('.todo-count');
    }

    addListenners() {
        this.newTodoInput.addEventListener('keypress', (e) => {
            if (e.keyCode === 13) {
                const todo =  new Todo({
                    content: this.newTodoInput.value
                });

                this.store.addTodo(todo);
                this.addTodo(todo);
                this.newTodoInput.value = '';
            }
        });

        this.btnClearCompleted.addEventListener('click', () => this.clearAllCompleted());
        this.btnFilterAll.addEventListener('click', (e) => this.filterTodo(e.target, 'all'));
        this.btnFilterActive.addEventListener('click', (e) => this.filterTodo(e.target, 'active'));
        this.btnFilterCompleted.addEventListener('click', (e) => this.filterTodo(e.target, 'completed'));
    }

    initList() {
        const todos = this.store.getAllTodos();
        todos.forEach(t => this.addTodo(t));
        this.refreshCounterAndList();
    }

    refreshCounterAndList() {
        const todos = this.store.getAllTodos();
        let itemsUnchecked = 0;

        todos.forEach(t => {
            if (!t.checked) {
                itemsUnchecked++;
            }
        });

        this.mainSection.style.display = todos.length > 0 ? 'block' : 'none';
        this.itemLeft.innerText = itemsUnchecked + ' item' + (itemsUnchecked < 0 ? 's' : '') + ' left';
    }

    addTodo(todo) {
        let li = document.createElement('li');
        li.setAttribute('data-id', todo.id);

        let input = document.createElement('input');
        input.type = 'checkbox';
        input.classList.add('toggle');
        input.addEventListener('click', () => this.toggleTodo(todo.id));

        if (todo.checked) {
            input.setAttribute('checked', 'checked');
            li.classList.add('completed');
        }

        let label = document.createElement('label');
        label.innerText = todo.content;
        label.addEventListener('dblclick', () => this.editTodo(todo));

        let button = document.createElement('button');
        button.classList.add('destroy');
        button.addEventListener('click', () => this.removeTodo(todo.id));

        li.appendChild(input);
        li.appendChild(label);
        li.appendChild(button);

        this.todoList.appendChild(li);
    }

    filterTodo(element, filter) {
        document.querySelectorAll(".filters a").forEach(el => {
            if (el === element) {
                el.classList.add('selected');
            } else {
                el.classList.remove('selected');
            }
        });

        switch (filter) {
            case 'all':
                this.todoList.querySelectorAll("li").forEach(el => el.style.display = 'block');
                break;

            case 'active':
                this.todoList.querySelectorAll("li").forEach(el => {
                    if (el.classList.contains('completed')) {
                        el.style.display = 'none'
                    } else {
                        el.style.display = 'block'
                    }
                });
                break;

            case 'completed':
                this.todoList.querySelectorAll("li").forEach(el => {
                    if (el.classList.contains('completed')) {
                        el.style.display = 'block'
                    } else {
                        el.style.display = 'none'
                    }
                });

                break;

            default:
                console.log("error, filter not defined");
                break;
        }
    }

    toggleTodo(id) {
        let li = this.todoList.querySelector("li[data-id='" + id + "']");
        let isChecked = this.store.toggleTodo(id);

        if (isChecked) {
            li.classList.add('completed');
        } else {
            li.classList.remove('completed');
        }
    }

    editTodo(todo) {
        let li = this.todoList.querySelector("li[data-id='" + todo.id + "']");
        li.classList.add('editing');

        let input = document.createElement('input');
        input.classList.add('edit');
        input.value = todo.content;
        input.addEventListener('blur', (e) => this.stopEditing(todo.id, e.target.value));
        input.addEventListener('keypress', (e) => {
            if (e.keyCode === 13) {
                this.stopEditing(todo.id, e.target.value)
            }
        });

        li.appendChild(input);
        li.querySelector('.edit').focus();
    }

    stopEditing(id, newContent) {
        let li = this.todoList.querySelector("li[data-id='" + id + "']");
        li.classList.remove('editing');
        li.querySelector('.edit').remove();
        li.querySelector('label').innerText = newContent;

        this.store.editTodo(id, newContent);
    }

    removeTodo(id) {
        this.todoList.querySelector("li[data-id='" + id + "']").remove();
        this.store.removeTodo(id);
    }

    clearAllCompleted() {
        this.todoList.querySelectorAll("li.completed").forEach(el => {
           el.remove();
        });

        this.store.clearAllCompleted();
    }
}