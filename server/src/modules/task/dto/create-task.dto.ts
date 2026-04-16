export interface CreateTaskDTO {
  title: string;
  description?: string;
  projectId: string;
  assignedTo: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  deadline?: Date;
}