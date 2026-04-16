"use client";
import { useState, useEffect } from "react";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/components/Button";
import { Avatar } from "@/shared/components/Avatar";
import { StatusBadge, PriorityBadge } from "@/shared/components/Badge";
import { taskService } from "@/services/task.service";
import { formatDate, formatRelative } from "@/shared/utils/format";
import type { Task, Comment } from "@/shared/types";
import { Send } from "lucide-react";
import toast from "react-hot-toast";

interface TaskDetailModalProps {
  open: boolean;
  onClose: () => void;
  task: Task;
}

export function TaskDetailModal({ open, onClose, task }: TaskDetailModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      taskService.getComments(task.id)
        .then(setComments)
        .catch(() => toast.error("Failed to load comments"))
        .finally(() => setLoading(false));
    }
  }, [open, task.id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const comment = await taskService.addComment(task.id, newComment.trim());
      setComments((c) => [...c, comment]);
      setNewComment("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={task.title} size="lg">
      <div className="space-y-5">
        {/* Meta */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-text-muted mb-1">Status</p>
            <StatusBadge status={task.status} />
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1">Priority</p>
            <PriorityBadge priority={task.priority} />
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1">Assigned to</p>
            <div className="flex items-center gap-2">
              <Avatar name={task.assignedTo.name} size="xs" />
              <span className="text-sm text-text-primary">{task.assignedTo.name}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1">Created by</p>
            <div className="flex items-center gap-2">
              <Avatar name={task.assignedBy.name} size="xs" />
              <span className="text-sm text-text-primary">{task.assignedBy.name}</span>
            </div>
          </div>
          {task.deadline && (
            <div>
              <p className="text-xs text-text-muted mb-1">Deadline</p>
              <span className="text-sm text-text-primary">{formatDate(task.deadline)}</span>
            </div>
          )}
          <div>
            <p className="text-xs text-text-muted mb-1">Created</p>
            <span className="text-sm text-text-primary">{formatRelative(task.createdAt)}</span>
          </div>
        </div>

        {task.description && (
          <div>
            <p className="text-xs text-text-muted mb-1">Description</p>
            <p className="text-sm text-text-primary bg-gray-50 rounded-md p-3">{task.description}</p>
          </div>
        )}

        {/* Comments */}
        <div>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
            Comments ({comments.length})
          </p>
          <div className="space-y-3 max-h-48 overflow-y-auto mb-3">
            {loading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : comments.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-4">No comments yet</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <Avatar name={c.user.name} size="xs" />
                  <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-text-primary">{c.user.name}</span>
                      <span className="text-[10px] text-text-muted">{formatRelative(c.createdAt)}</span>
                    </div>
                    <p className="text-xs text-text-secondary">{c.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add comment */}
          <div className="flex gap-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAddComment()}
              placeholder="Add a comment..."
              className="flex-1 h-9 px-3 rounded-md border border-border bg-white text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
            <Button
              size="icon"
              onClick={handleAddComment}
              loading={submitting}
              disabled={!newComment.trim()}
              icon={<Send size={14} />}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
