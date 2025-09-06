export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  isActive?: boolean;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
