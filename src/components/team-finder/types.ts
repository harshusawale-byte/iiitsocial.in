export interface TeamFinderProfile {
  id: string;
  is_looking: boolean;
  project_title: string | null;
  project_description: string | null;
  required_skills: string[];
  preferred_roles: string[];
  max_team_size: number | null;
  created_at: string;
  updated_at: string;
}

export interface TeamFinderProfileWithUser extends TeamFinderProfile {
  user_name: string;
  user_username: string;
  user_avatar: string;
  user_bio: string | null;
  user_branch: string;
  user_academic_year: string;
  user_graduation_year: number;
  user_is_verified: boolean;
  user_skills: string[];
  user_interests: string[];
}

export interface TeamRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface RequestWithProfile extends TeamRequest {
  other_user_name: string;
  other_user_username: string;
  other_user_avatar: string;
  other_user_branch: string;
  other_user_academic_year: string;
  other_user_is_verified: boolean;
  partner_project_title: string | null;
  partner_project_description: string | null;
}

export type TabType = 'discover' | 'my-finder' | 'requests';

export interface RequestState {
  status: 'pending' | 'accepted' | 'rejected';
  isOutgoing: boolean;
}
