'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../lib/supabase/client';
import { useStore } from '../../store/store';
import type { TeamFinderProfile, TeamFinderProfileWithUser, TeamRequest, RequestWithProfile, RequestState } from './types';

// ─── Data fetching ───────────────────────────────────────────────────────────

async function fetchTeamFinderProfiles(): Promise<TeamFinderProfileWithUser[]> {
  const { data: profiles, error: profileError } = await supabase
    .from('team_finder_profiles')
    .select('*')
    .eq('is_looking', true)
    .order('updated_at', { ascending: false });

  if (profileError) throw profileError;
  if (!profiles || profiles.length === 0) return [];

  const userIds = profiles.map((p: TeamFinderProfile) => p.id);

  const { data: users } = await supabase
    .from('profiles')
    .select('id, name, username, avatar, bio, branch, academic_year, graduation_year, is_verified, skills, interests')
    .in('id', userIds);

  if (!users) return [];

  const userMap = new Map(users.map((u: Record<string, unknown>) => [u.id, u]));

  return profiles.map((p: TeamFinderProfile) => {
    const u = userMap.get(p.id) as Record<string, unknown> | undefined;
    return {
      ...p,
      user_name: (u?.name as string) || 'Unknown',
      user_username: (u?.username as string) || 'unknown',
      user_avatar: (u?.avatar as string) || '',
      user_bio: (u?.bio as string) || null,
      user_branch: (u?.branch as string) || 'CSE',
      user_academic_year: (u?.academic_year as string) || '1st Year',
      user_graduation_year: (u?.graduation_year as number) || 2028,
      user_is_verified: (u?.is_verified as boolean) || false,
      user_skills: (u?.skills as string[]) || [],
      user_interests: (u?.interests as string[]) || [],
    };
  });
}

async function fetchTeamRequests(userId: string): Promise<{ incoming: RequestWithProfile[]; outgoing: RequestWithProfile[] }> {
  const [incomingResult, outgoingResult] = await Promise.all([
    supabase
      .from('team_requests')
      .select('*')
      .eq('receiver_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('team_requests')
      .select('*')
      .eq('sender_id', userId)
      .order('created_at', { ascending: false }),
  ]);

  if (incomingResult.error) throw incomingResult.error;
  if (outgoingResult.error) throw outgoingResult.error;

  const incoming = (incomingResult.data || []) as TeamRequest[];
  const outgoing = (outgoingResult.data || []) as TeamRequest[];

  // Collect all partner user IDs
  const allUserIds = new Set<string>();
  incoming.forEach(r => allUserIds.add(r.sender_id));
  outgoing.forEach(r => allUserIds.add(r.receiver_id));

  // Fetch profile data + project info for all partners in parallel
  const partnerIds = Array.from(allUserIds);
  const [usersResult, projectsResult] = await Promise.all([
    allUserIds.size > 0
      ? supabase
          .from('profiles')
          .select('id, name, username, avatar, branch, academic_year, is_verified')
          .in('id', partnerIds)
      : { data: null, error: null },
    allUserIds.size > 0
      ? supabase
          .from('team_finder_profiles')
          .select('id, project_title, project_description')
          .in('id', partnerIds)
      : { data: null, error: null },
  ]);

  const userData: Record<string, Record<string, unknown>> = {};
  if (usersResult.data) {
    usersResult.data.forEach((u: Record<string, unknown>) => { userData[u.id as string] = u; });
  }

  const projectData: Record<string, Record<string, unknown>> = {};
  if (projectsResult.data) {
    projectsResult.data.forEach((p: Record<string, unknown>) => { projectData[p.id as string] = p; });
  }

  const mapProfile = (r: TeamRequest): RequestWithProfile => {
    const targetId = r.sender_id === userId ? r.receiver_id : r.sender_id;
    const u = userData[targetId];
    const proj = projectData[targetId];
    return {
      ...r,
      other_user_name: (u?.name as string) || 'Unknown',
      other_user_username: (u?.username as string) || 'unknown',
      other_user_avatar: (u?.avatar as string) || '',
      other_user_branch: (u?.branch as string) || '',
      other_user_academic_year: (u?.academic_year as string) || '',
      other_user_is_verified: (u?.is_verified as boolean) || false,
      partner_project_title: (proj?.project_title as string) || null,
      partner_project_description: (proj?.project_description as string) || null,
    };
  };

  return {
    incoming: incoming.map(mapProfile),
    outgoing: outgoing.map(mapProfile),
  };
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useTeamFinder() {
  const { state } = useStore();
  const userId = state.currentUser?.id;

  // Discover
  const [profiles, setProfiles] = useState<TeamFinderProfileWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // My Finder
  const [myProfile, setMyProfile] = useState<TeamFinderProfile | null>(null);
  const [myProfileLoading, setMyProfileLoading] = useState(true);
  const [myProfileError, setMyProfileError] = useState<string | null>(null);

  // Requests
  const [incomingRequests, setIncomingRequests] = useState<RequestWithProfile[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<RequestWithProfile[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState<string | null>(null);

  // UI
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [requestModalUser, setRequestModalUser] = useState<TeamFinderProfileWithUser | null>(null);

  // ─── Derived: request states for Discover cards (tracks BOTH directions) ────

  const requestStatesMap = useMemo(() => {
    const map = new Map<string, RequestState>();
    outgoingRequests.forEach(r => { map.set(r.receiver_id, { status: r.status, isOutgoing: true }); });
    incomingRequests.forEach(r => { map.set(r.sender_id, { status: r.status, isOutgoing: false }); });
    return map;
  }, [incomingRequests, outgoingRequests]);

  // ─── Loaders ───────────────────────────────────────────────────────────────

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProfiles(await fetchTeamFinderProfiles());
    } catch {
      setError('Failed to load listings. Please try again.');
    }
    setLoading(false);
  }, []);

  const loadMyProfile = useCallback(async () => {
    if (!userId) return;
    setMyProfileLoading(true);
    setMyProfileError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('team_finder_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (dbError) throw dbError;
      setMyProfile(data as TeamFinderProfile | null);
    } catch {
      setMyProfileError('Failed to load your listing.');
    }
    setMyProfileLoading(false);
  }, [userId]);

  const loadRequests = useCallback(async () => {
    if (!userId) return;
    setRequestsLoading(true);
    setRequestsError(null);
    try {
      const { incoming, outgoing } = await fetchTeamRequests(userId);
      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);
    } catch {
      setRequestsError('Failed to load requests.');
    }
    setRequestsLoading(false);
  }, [userId]);

  // ─── Initial load ──────────────────────────────────────────────────────────

  useEffect(() => {
    loadProfiles();
    loadMyProfile();
    loadRequests();
  }, [loadProfiles, loadMyProfile, loadRequests]);

  // ─── Actions ───────────────────────────────────────────────────────────────

  const handleSendRequest = useCallback(async () => {
    await loadProfiles();
    await loadRequests();
    setRequestModalUser(null);
  }, [loadProfiles, loadRequests]);

  const acceptRequest = useCallback(async (requestId: string) => {
    setLoadingAction(requestId);
    const { error: dbError } = await supabase
      .from('team_requests')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', requestId);
    if (!dbError) await loadRequests();
    setLoadingAction(null);
  }, [loadRequests]);

  const rejectRequest = useCallback(async (requestId: string) => {
    setLoadingAction(requestId);
    const { error: dbError } = await supabase
      .from('team_requests')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', requestId);
    if (!dbError) await loadRequests();
    setLoadingAction(null);
  }, [loadRequests]);

  const withdrawRequest = useCallback(async (requestId: string) => {
    setLoadingAction(requestId);
    const { error: dbError } = await supabase
      .from('team_requests')
      .delete()
      .eq('id', requestId);
    if (!dbError) await loadRequests();
    setLoadingAction(null);
  }, [loadRequests]);

  return {
    userId,
    profiles, loading, error,
    myProfile, myProfileLoading, myProfileError,
    incomingRequests, outgoingRequests, requestsLoading, requestsError,
    loadingAction,
    requestModalUser, setRequestModalUser,
    requestStatesMap,
    loadProfiles, loadMyProfile, loadRequests,
    handleSendRequest,
    acceptRequest, rejectRequest, withdrawRequest,
  };
}
