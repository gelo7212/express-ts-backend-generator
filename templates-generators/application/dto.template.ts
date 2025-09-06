export interface <%= pascalCase %>Request {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface <%= pascalCase %>Response {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Create<%= pascalCase %>Request {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface Update<%= pascalCase %>Request {
  name?: string;
  description?: string;
  isActive?: boolean;
}
