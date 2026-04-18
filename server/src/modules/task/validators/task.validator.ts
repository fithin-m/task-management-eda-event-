export const validateCreateTask = (data: any) => {
  const { title, projectId, assignedTo, priority } = data;

  if (!title || String(title).trim() === "") {
    throw new Error("Title is required");
  }
  if (!projectId || String(projectId).trim() === "") {
    throw new Error("Project ID is required");
  }
  if (!assignedTo || String(assignedTo).trim() === "") {
    throw new Error("Assigned user is required");
  }
  
  // Validate priority if provided
  if (priority && !["LOW", "MEDIUM", "HIGH"].includes(priority)) {
    throw new Error("Invalid priority. Must be LOW, MEDIUM, or HIGH");
  }
};