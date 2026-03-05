export const memoryStore = {
  users: [],
  tasks: []
};

let counter = 1;

export const createId = () => String(counter++);
