// Mock user data for testing different roles
export const mockUsers = [
  {
    id: 'admin-001',
    email: 'admin@nsync.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    joinDate: 'January 2024',
    avatar: 'AU',
  },
  {
    id: 'user-001', 
    email: 'john@nsync.com',
    password: 'user123',
    name: 'John Doe',
    role: 'user',
    joinDate: 'February 2024',
    avatar: 'JD',
  },
  {
    id: 'user-002',
    email: 'sarah@nsync.com', 
    password: 'user123',
    name: 'Sarah Smith',
    role: 'user',
    joinDate: 'March 2024',
    avatar: 'SS',
  }
];

// Mock boards data
export const mockBoards = [
  {
    id: 'board-1',
    title: 'Development',
    description: 'All development tasks and features',
    color: '#22C55E',
    createdBy: 'admin-001',
    createdAt: '2024-01-15',
    members: ['admin-001', 'user-001'],
  },
  {
    id: 'board-2',
    title: 'Design',
    description: 'UI/UX design tasks and mockups',
    color: '#3B82F6',
    createdBy: 'admin-001',
    createdAt: '2024-01-20',
    members: ['admin-001', 'user-002'],
  },
  {
    id: 'board-3',
    title: 'Marketing',
    description: 'Marketing campaigns and content',
    color: '#F59E0B',
    createdBy: 'admin-001',
    createdAt: '2024-02-01',
    members: ['admin-001'],
  }
];

// Mock tasks data
export const mockTasks = [
  {
    id: 'task-1',
    title: 'Setup Firebase Authentication',
    description: 'Implement Firebase Auth with email and Google Sign-in',
    status: 'in_progress',
    priority: 'high',
    boardId: 'board-1',
    assignedTo: 'user-001',
    createdBy: 'admin-001',
    dueDate: '2024-01-25',
    createdAt: '2024-01-15',
  },
  {
    id: 'task-2',
    title: 'Design Login Screen',
    description: 'Create modern login interface with NSYNC branding',
    status: 'done',
    priority: 'high',
    boardId: 'board-2',
    assignedTo: 'user-002',
    createdBy: 'admin-001',
    dueDate: '2024-01-22',
    createdAt: '2024-01-16',
  },
  {
    id: 'task-3',
    title: 'Implement Kanban Board',
    description: 'Build drag-and-drop Kanban interface',
    status: 'todo',
    priority: 'medium',
    boardId: 'board-1',
    assignedTo: 'user-001',
    createdBy: 'admin-001',
    dueDate: '2024-01-30',
    createdAt: '2024-01-17',
  },
  {
    id: 'task-4',
    title: 'Create User Dashboard',
    description: 'Build dashboard for regular users',
    status: 'todo',
    priority: 'medium',
    boardId: 'board-1',
    assignedTo: null,
    createdBy: 'admin-001',
    dueDate: '2024-02-05',
    createdAt: '2024-01-18',
  }
];

// Mock comments data
export const mockComments = [
  {
    id: 'comment-1',
    content: 'I\'ve started working on the Firebase setup. Should be ready by tomorrow.',
    taskId: 'task-1',
    authorId: 'user-001',
    createdAt: '2024-01-16T10:30:00Z',
  },
  {
    id: 'comment-2',
    content: 'Great! Let me know if you need any help with the configuration.',
    taskId: 'task-1',
    authorId: 'admin-001',
    createdAt: '2024-01-16T11:15:00Z',
  },
  {
    id: 'comment-3',
    content: 'Design is complete and ready for review!',
    taskId: 'task-2',
    authorId: 'user-002',
    createdAt: '2024-01-17T14:20:00Z',
  }
];
