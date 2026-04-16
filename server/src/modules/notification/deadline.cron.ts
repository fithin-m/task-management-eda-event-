/**
 * Deadline Reminder Cron
 * ----------------------
 * Runs every hour and checks for tasks/projects with deadlines
 * that are within 24 hours or have just passed.
 *
 * Uses a simple setInterval — replace with node-cron in production.
 */
import prisma from "../../core/database/prisma";
import { notificationEmitter } from "./notification.emitter";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

async function checkDeadlines() {
  const now = new Date();
  const in24h = new Date(now.getTime() + ONE_DAY_MS);

  try {
    // ── Tasks approaching deadline (within next 24h, not yet overdue) ──────
    const upcomingTasks = await prisma.task.findMany({
      where: {
        deadline: { gte: now, lte: in24h },
        status:   { not: "COMPLETED" },
      },
      include: {
        assignee: { select: { id: true, name: true } },
        project:  { select: { name: true } },
      },
    });

    for (const task of upcomingTasks) {
      await notificationEmitter.send({
        userId:    task.assignedTo,
        type:      "DEADLINE_REMINDER",
        message:   `Task "${task.title}" in project "${task.project.name}" is due within 24 hours`,
        taskId:    task.id,
        projectId: task.projectId,
      });
    }

    // ── Tasks that just passed deadline ────────────────────────────────────
    const overdueTasks = await prisma.task.findMany({
      where: {
        deadline: {
          gte: new Date(now.getTime() - ONE_DAY_MS), // passed in last 24h
          lt:  now,
        },
        status: { not: "COMPLETED" },
      },
      include: {
        assignee: { select: { id: true, name: true } },
        project:  { select: { name: true } },
      },
    });

    for (const task of overdueTasks) {
      await notificationEmitter.send({
        userId:    task.assignedTo,
        type:      "DEADLINE_REMINDER",
        message:   `Task "${task.title}" in project "${task.project.name}" deadline has passed`,
        taskId:    task.id,
        projectId: task.projectId,
      });
    }

    if (upcomingTasks.length + overdueTasks.length > 0) {
      console.log(
        `⏰ Deadline check: ${upcomingTasks.length} upcoming, ${overdueTasks.length} overdue`,
      );
    }
  } catch (err) {
    console.error("Deadline cron error:", err);
  }
}

export function startDeadlineCron() {
  // Run immediately on startup, then every hour
  checkDeadlines();
  setInterval(checkDeadlines, 60 * 60 * 1000);
  console.log("⏰ Deadline reminder cron started");
}
