'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase/client';
import { useStore } from '../../store/store';
import type { Opportunity, SavedOpportunity, OpportunityApplication } from '../../types';

// ─── Data fetching ───────────────────────────────────────────────────────────

async function fetchOpportunities(): Promise<Opportunity[]> {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Opportunity[];
}

async function fetchSavedOpportunities(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('saved_opportunities')
    .select('opportunity_id')
    .eq('user_id', userId);

  if (error) throw error;
  return (data || []).map((s: { opportunity_id: string }) => s.opportunity_id);
}

async function fetchMyApplications(userId: string): Promise<(OpportunityApplication & { opportunity_title?: string; opportunity_organizer?: string; opportunity_category?: string })[]> {
  const { data, error } = await supabase
    .from('opportunity_applications')
    .select('*')
    .eq('applicant_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const apps = (data || []) as OpportunityApplication[];
  if (apps.length === 0) return [];

  // Fetch opportunity details for each application
  const oppIds = [...new Set(apps.map(a => a.opportunity_id))];
  const { data: opps } = await supabase
    .from('opportunities')
    .select('id, title, organizer, category')
    .in('id', oppIds);

  const oppMap = new Map((opps || []).map((o: Record<string, unknown>) => [o.id as string, o]));

  return apps.map(a => {
    const opp = oppMap.get(a.opportunity_id) as Record<string, unknown> | undefined;
    return {
      ...a,
      opportunity_title: opp?.title as string | undefined,
      opportunity_organizer: opp?.organizer as string | undefined,
      opportunity_category: opp?.category as string | undefined,
    };
  });
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useOpportunities() {
  const { state } = useStore();
  const userId = state.currentUser?.id;

  // Opportunities
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Saved
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);

  // My applications
  const [myApplications, setMyApplications] = useState<Awaited<ReturnType<typeof fetchMyApplications>>>([]);
  const [appsLoading, setAppsLoading] = useState(true);

  // ─── Loaders ─────────────────────────────────────────────────────────────

  const loadOpportunities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOpportunities(await fetchOpportunities());
    } catch {
      setError('Failed to load opportunities. Please try again.');
    }
    setLoading(false);
  }, []);

  const loadSaved = useCallback(async () => {
    if (!userId) return;
    try {
      const ids = await fetchSavedOpportunities(userId);
      setSavedIds(new Set(ids));
    } catch {
      // Silent — saved state is non-critical
    }
  }, [userId]);

  const loadMyApplications = useCallback(async () => {
    if (!userId) return;
    setAppsLoading(true);
    try {
      setMyApplications(await fetchMyApplications(userId));
    } catch {
      // Silent — applications load is non-critical
    }
    setAppsLoading(false);
  }, [userId]);

  // ─── Initial load ──────────────────────────────────────────────────────

  useEffect(() => {
    loadOpportunities();
    loadSaved();
    loadMyApplications();
  }, [loadOpportunities, loadSaved, loadMyApplications]);

  // ─── Actions ───────────────────────────────────────────────────────────

  const toggleSave = useCallback(async (opportunityId: string) => {
    if (!userId) return;
    setSavingId(opportunityId);

    const isSaved = savedIds.has(opportunityId);

    if (isSaved) {
      const { error: dbError } = await supabase
        .from('saved_opportunities')
        .delete()
        .eq('user_id', userId)
        .eq('opportunity_id', opportunityId);

      if (!dbError) {
        setSavedIds(prev => {
          const next = new Set(prev);
          next.delete(opportunityId);
          return next;
        });
      }
    } else {
      const { error: dbError } = await supabase
        .from('saved_opportunities')
        .insert({ user_id: userId, opportunity_id: opportunityId });

      if (!dbError) {
        setSavedIds(prev => new Set(prev).add(opportunityId));
      }
    }

    setSavingId(null);
  }, [userId, savedIds]);

  const applyToOpportunity = useCallback(async (opportunityId: string, message?: string): Promise<{ error: string | null }> => {
    if (!userId) return { error: 'Not authenticated.' };

    const { error: dbError } = await supabase
      .from('opportunity_applications')
      .insert({
        opportunity_id: opportunityId,
        applicant_id: userId,
        message: message?.trim() || null,
        status: 'pending',
      });

    if (dbError) {
      if (dbError.code === '23505') {
        return { error: 'You have already applied to this opportunity.' };
      }
      return { error: 'Failed to submit application. Please try again.' };
    }

    await loadMyApplications();
    return { error: null };
  }, [userId, loadMyApplications]);

  const withdrawApplication = useCallback(async (applicationId: string) => {
    if (!userId) return;

    const { error: dbError } = await supabase
      .from('opportunity_applications')
      .delete()
      .eq('id', applicationId)
      .eq('applicant_id', userId);

    if (!dbError) await loadMyApplications();
  }, [userId, loadMyApplications]);

  return {
    userId,
    opportunities, loading, error,
    savedIds, savingId, toggleSave,
    myApplications, appsLoading,
    applyToOpportunity, withdrawApplication,
    loadOpportunities, loadMyApplications,
  };
}
