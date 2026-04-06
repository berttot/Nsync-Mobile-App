export type Role = "admin" | "user";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  joinDate: string;
  avatar: string;
}
