export interface Board {
  id: string;
  title: string;
  description?: string;
  color?: string;
  members?: string[];
  workspaceId?: string;
  createdAt?: any;
}
