'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';
import type { TeamFinderProfile } from './types';

const SUGGESTED_SKILLS = ['JavaScript', 'TypeScript', 'Python', 'React', 'Node.js', 'Next.js', 'Supabase', 'PostgreSQL', 'Tailwind CSS', 'GraphQL', 'Docker', 'AWS', 'Machine Learning', 'UI/UX', 'Figma'];
const SUGGESTED_ROLES = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'UI/UX Designer', 'Project Manager', 'Data Scientist', 'DevOps Engineer', 'Mobile Developer', 'QA Tester', 'Technical Writer'];

export default function MyFinderForm({
  userId,
  existingProfile,
  onSaved,
}: {
  userId: string;
  existingProfile: TeamFinderProfile | null;
  onSaved: () => void;
}) {
  const [isLooking, setIsLooking] = useState(existingProfile?.is_looking ?? false);
  const [projectTitle, setProjectTitle] = useState(existingProfile?.project_title ?? '');
  const [projectDesc, setProjectDesc] = useState(existingProfile?.project_description ?? '');
  const [requiredSkills, setRequiredSkills] = useState<string[]>(existingProfile?.required_skills ?? []);
  const [preferredRoles, setPreferredRoles] = useState<string[]>(existingProfile?.preferred_roles ?? []);
  const [maxTeamSize, setMaxTeamSize] = useState(existingProfile?.max_team_size?.toString() ?? '4');
  const [skillInput, setSkillInput] = useState('');
  const [roleInput, setRoleInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (existingProfile) {
      setIsLooking(existingProfile.is_looking);
      setProjectTitle(existingProfile.project_title ?? '');
      setProjectDesc(existingProfile.project_description ?? '');
      setRequiredSkills(existingProfile.required_skills ?? []);
      setPreferredRoles(existingProfile.preferred_roles ?? []);
      setMaxTeamSize(existingProfile.max_team_size?.toString() ?? '4');
    }
  }, [existingProfile]);

  const addSkill = (val: string) => {
    const trimmed = val.trim();
    if (trimmed && !requiredSkills.includes(trimmed)) setRequiredSkills([...requiredSkills, trimmed]);
    setSkillInput('');
  };

  const addRole = (val: string) => {
    const trimmed = val.trim();
    if (trimmed && !preferredRoles.includes(trimmed)) setPreferredRoles([...preferredRoles, trimmed]);
    setRoleInput('');
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);

    const payload = {
      id: userId,
      is_looking: isLooking,
      project_title: projectTitle.trim() || null,
      project_description: projectDesc.trim() || null,
      required_skills: requiredSkills,
      preferred_roles: preferredRoles,
      max_team_size: parseInt(maxTeamSize) || 4,
      updated_at: new Date().toISOString(),
    };

    const { error } = existingProfile
      ? await supabase.from('team_finder_profiles').update(payload).eq('id', userId)
      : await supabase.from('team_finder_profiles').upsert({ ...payload, created_at: new Date().toISOString() });

    setSaving(false);
    if (error) {
      setSaveMsg({ type: 'error', text: 'Failed to save. Please try again.' });
    } else {
      setSaveMsg({ type: 'success', text: 'Saved successfully!' });
      onSaved();
      setTimeout(() => setSaveMsg(null), 3000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="bg-[#141414] border border-[#262626] rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white text-sm font-semibold">Team Finder Listing</h3>
            <p className="text-[#666] text-xs mt-0.5">
              {isLooking ? 'Your listing is visible to others' : 'Turn on to appear in Team Finder'}
            </p>
          </div>
          <button
            onClick={() => setIsLooking(!isLooking)}
            className={`relative w-12 h-6 rounded-full transition-all ${isLooking ? 'bg-[#e50914]' : 'bg-[#262626]'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${isLooking ? 'left-[26px]' : 'left-0.5'}`} />
          </button>
        </div>
      </div>

      {isLooking && (
        <>
          {/* Project info */}
          <div className="bg-[#141414] border border-[#262626] rounded-xl p-4 space-y-3">
            <h3 className="text-white text-sm font-semibold">Project Details</h3>
            <div>
              <label className="text-[#666] text-xs mb-1 block">Project Title</label>
              <input value={projectTitle} onChange={e => setProjectTitle(e.target.value)} placeholder="e.g. Campus Navigation App"
                className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2 text-sm text-white placeholder-[#444] focus:border-[#e50914] focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="text-[#666] text-xs mb-1 block">Project Description</label>
              <textarea value={projectDesc} onChange={e => setProjectDesc(e.target.value)} rows={3} placeholder="Describe your project idea..."
                className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2 text-sm text-white placeholder-[#444] focus:border-[#e50914] focus:outline-none transition-colors resize-none" />
            </div>
            <div>
              <label className="text-[#666] text-xs mb-1 block">Max Team Size</label>
              <input type="number" min={2} max={20} value={maxTeamSize} onChange={e => setMaxTeamSize(e.target.value)}
                className="w-24 bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2 text-sm text-white placeholder-[#444] focus:border-[#e50914] focus:outline-none transition-colors" />
            </div>
          </div>

          {/* Required Skills */}
          <div className="bg-[#141414] border border-[#262626] rounded-xl p-4 space-y-3">
            <h3 className="text-white text-sm font-semibold">Required Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {requiredSkills.map(skill => (
                <span key={skill} className="text-xs px-2.5 py-1 bg-[#e50914]/10 text-[#e50914] rounded-full font-medium flex items-center gap-1">
                  {skill}
                  <button onClick={() => setRequiredSkills(requiredSkills.filter(s => s !== skill))} className="ml-0.5 hover:text-white">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }}
                placeholder="Add a skill..."
                className="flex-1 bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2 text-sm text-white placeholder-[#444] focus:border-[#e50914] focus:outline-none transition-colors" />
              <button onClick={() => addSkill(skillInput)}
                className="px-3 py-2 bg-[#262626] text-[#a0a0a0] text-xs font-medium rounded-lg hover:text-white hover:bg-[#333] transition-all">Add</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_SKILLS.filter(s => !requiredSkills.includes(s)).slice(0, 8).map(skill => (
                <button key={skill} onClick={() => addSkill(skill)}
                  className="text-[10px] px-2 py-0.5 bg-white/5 text-[#666] rounded-full hover:text-white hover:bg-white/10 transition-all">+ {skill}</button>
              ))}
            </div>
          </div>

          {/* Preferred Roles */}
          <div className="bg-[#141414] border border-[#262626] rounded-xl p-4 space-y-3">
            <h3 className="text-white text-sm font-semibold">Preferred Roles</h3>
            <div className="flex flex-wrap gap-1.5">
              {preferredRoles.map(role => (
                <span key={role} className="text-xs px-2.5 py-1 bg-purple-500/10 text-purple-400 rounded-full font-medium flex items-center gap-1">
                  {role}
                  <button onClick={() => setPreferredRoles(preferredRoles.filter(r => r !== role))} className="ml-0.5 hover:text-white">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={roleInput} onChange={e => setRoleInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addRole(roleInput); } }}
                placeholder="Add a role..."
                className="flex-1 bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2 text-sm text-white placeholder-[#444] focus:border-[#e50914] focus:outline-none transition-colors" />
              <button onClick={() => addRole(roleInput)}
                className="px-3 py-2 bg-[#262626] text-[#a0a0a0] text-xs font-medium rounded-lg hover:text-white hover:bg-[#333] transition-all">Add</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_ROLES.filter(r => !preferredRoles.includes(r)).slice(0, 6).map(role => (
                <button key={role} onClick={() => addRole(role)}
                  className="text-[10px] px-2 py-0.5 bg-white/5 text-[#666] rounded-full hover:text-white hover:bg-white/10 transition-all">+ {role}</button>
              ))}
            </div>
          </div>

          {/* Save button */}
          <div className="flex items-center gap-3">
            <button onClick={handleSave} disabled={saving}
              className="px-6 py-2.5 bg-[#e50914] hover:bg-[#ff1a25] text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-[#e50914]/15">
              {saving ? 'Saving...' : 'Save Listing'}
            </button>
            {saveMsg && (
              <span className={`text-xs font-medium ${saveMsg.type === 'success' ? 'text-green-500' : 'text-red-400'}`}>{saveMsg.text}</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
