export interface Task {
  id: string;
  title: string;
  description?: string;
  status?: "todo" | "in_progress" | "done";
  assignedTo?: string;
  boardId?: string;
  workspaceId?: string;
  dueDate?: string;
  createdAt?: any;
  updatedAt?: any;
}
