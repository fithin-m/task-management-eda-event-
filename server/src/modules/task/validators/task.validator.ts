export const validateCreateTask = (data: any) => {
  const { title, projectId, assignedTo } = data;

  if (!title) throw new Error("Title is required");
  if (!projectId) throw new Error("Project ID is required");
  if (!assignedTo) throw new Error("Assigned user is required");
};