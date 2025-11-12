"use client";

import { useCallback, useEffect, useState } from "react";
import { GroupService, type GroupDTO, type CreateGroupInput, type UpdateGroupInput } from "@/lib/group-service";

export function useGroups() {
  const [groups, setGroups] = useState<GroupDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await GroupService.list({ limit: 100, offset: 0 });
      setGroups(data);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to load groups");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const createGroup = useCallback(async (input: CreateGroupInput) => {
    const created = await GroupService.create(input);
    setGroups((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateGroup = useCallback(async (id: string, input: UpdateGroupInput) => {
    const updated = await GroupService.update(id, input);
    setGroups((prev) => prev.map((g) => (g.id === id ? updated : g)));
    return updated;
  }, []);

  const deleteGroup = useCallback(async (id: string) => {
    await GroupService.delete(id);
    setGroups((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const joinGroup = useCallback(async (id: string) => {
    await GroupService.join(id);
    // Refresh groups to get updated membership
    await fetchGroups();
  }, [fetchGroups]);

  const leaveGroup = useCallback(async (id: string) => {
    await GroupService.leave(id);
    // Refresh groups to get updated membership
    await fetchGroups();
  }, [fetchGroups]);

  return {
    groups,
    loading,
    error,
    refresh: fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    joinGroup,
    leaveGroup,
  };
}

export function useGroup(groupId: string) {
  const [group, setGroup] = useState<GroupDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroup = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await GroupService.getById(groupId);
      setGroup(data);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to load group");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  const joinGroup = useCallback(async () => {
    await GroupService.join(groupId);
    await fetchGroup();
  }, [groupId, fetchGroup]);

  const leaveGroup = useCallback(async () => {
    await GroupService.leave(groupId);
    await fetchGroup();
  }, [groupId, fetchGroup]);

  const isMember = useCallback((userId: string) => {
    return group?.memberships?.some((m) => m.userId === userId) || false;
  }, [group]);

  return {
    group,
    loading,
    error,
    refresh: fetchGroup,
    joinGroup,
    leaveGroup,
    isMember,
  };
}