"use client";

import { useCallback, useEffect, useState } from "react";
import { ForumService, type ForumDTO, type CreateForumInput, type UpdateForumInput } from "@/lib/forum-service";

export function useForums() {
  const [forums, setForums] = useState<ForumDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchForums = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ForumService.list({ limit: 100, offset: 0 });
      setForums(data);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to load forums");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForums();
  }, [fetchForums]);

  const createForum = useCallback(async (input: CreateForumInput) => {
    const created = await ForumService.create(input);
    setForums((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateForum = useCallback(async (id: string, input: UpdateForumInput) => {
    const updated = await ForumService.update(id, input);
    setForums((prev) => prev.map((f) => (f.id === id ? updated : f)));
    return updated;
  }, []);

  const deleteForum = useCallback(async (id: string) => {
    await ForumService.delete(id);
    setForums((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const joinForum = useCallback(async (id: string) => {
    await ForumService.join(id);
    await fetchForums();
  }, [fetchForums]);

  const leaveForum = useCallback(async (id: string) => {
    await ForumService.leave(id);
    await fetchForums();
  }, [fetchForums]);

  return {
    forums,
    loading,
    error,
    refresh: fetchForums,
    createForum,
    updateForum,
    deleteForum,
    joinForum,
    leaveForum,
  };
}

export function useForum(forumId: string) {
  const [forum, setForum] = useState<ForumDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchForum = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ForumService.getById(forumId);
      setForum(data);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to load forum");
    } finally {
      setLoading(false);
    }
  }, [forumId]);

  useEffect(() => {
    fetchForum();
  }, [fetchForum]);

  const joinForum = useCallback(async () => {
    await ForumService.join(forumId);
    await fetchForum();
  }, [forumId, fetchForum]);

  const leaveForum = useCallback(async () => {
    await ForumService.leave(forumId);
    await fetchForum();
  }, [forumId, fetchForum]);

  const isMember = useCallback((userId: string) => {
    return forum?.memberships?.some((m) => m.userId === userId) || false;
  }, [forum]);

  return {
    forum,
    loading,
    error,
    refresh: fetchForum,
    joinForum,
    leaveForum,
    isMember,
  };
}
