export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  createdAt?: any;
}

export interface WorkspaceMember {
  id?: string;
  workspaceId: string;
  userId: string;
  role: "admin" | "user";
  joinedAt?: any;
  workspaceName?: string;
}

export interface WorkspaceInvite {
  id?: string;
  workspaceId: string;
  email: string;
  role: "admin" | "user";
  invitedBy: string;
  code: string;
  status: "pending" | "accepted" | "revoked";
  createdAt?: any;
  acceptedAt?: any;
  acceptedBy?: string;
  revokedAt?: any;
  revokedBy?: string;
}
