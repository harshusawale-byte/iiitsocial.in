-- IIITSocial: Opportunity Hub Tables
-- Enables students to discover and apply for campus-relevant opportunities

BEGIN;

-- ============================================
-- 1. OPPORTUNITIES TABLE
-- ============================================

CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  description TEXT NOT NULL CHECK (length(trim(description)) > 0),
  category TEXT NOT NULL CHECK (category IN ('internships', 'hackathons', 'scholarships', 'research', 'competitions', 'workshops', 'other')),
  organizer TEXT NOT NULL CHECK (length(trim(organizer)) > 0),
  eligibility TEXT,
  required_skills TEXT[] DEFAULT '{}',
  deadline TIMESTAMPTZ,
  location TEXT,
  application_method TEXT NOT NULL CHECK (application_method IN ('external', 'internal')),
  application_url TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- External opportunities must have a URL
  CHECK (application_method = 'internal' OR (application_method = 'external' AND application_url IS NOT NULL AND length(trim(application_url)) > 0))
);

-- Indexes
CREATE INDEX idx_opportunities_created_by ON opportunities(created_by);
CREATE INDEX idx_opportunities_category ON opportunities(category);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_deadline ON opportunities(deadline);
CREATE INDEX idx_opportunities_created_at ON opportunities(created_at DESC);

-- ============================================
-- 2. OPPORTUNITY APPLICATIONS TABLE
-- ============================================

CREATE TABLE opportunity_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- One application per user per opportunity
  UNIQUE(opportunity_id, applicant_id)
);

-- Indexes
CREATE INDEX idx_opportunity_applications_opportunity ON opportunity_applications(opportunity_id);
CREATE INDEX idx_opportunity_applications_applicant ON opportunity_applications(applicant_id);
CREATE INDEX idx_opportunity_applications_status ON opportunity_applications(status);
CREATE INDEX idx_opportunity_applications_created_at ON opportunity_applications(created_at DESC);

-- ============================================
-- 3. SAVED OPPORTUNITIES TABLE
-- ============================================

CREATE TABLE saved_opportunities (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),

  PRIMARY KEY (user_id, opportunity_id)
);

-- Indexes
CREATE INDEX idx_saved_opportunities_user ON saved_opportunities(user_id);
CREATE INDEX idx_saved_opportunities_opportunity ON saved_opportunities(opportunity_id);

-- ============================================
-- 4. ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all three tables
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_opportunities ENABLE ROW LEVEL SECURITY;

-- ─── OPPORTUNITIES RLS ─────────────────────────────────────

-- SELECT: authenticated users can view active opportunities + creators can view their own
CREATE POLICY "Users can view active opportunities" ON opportunities
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      status = 'active'
      OR created_by = auth.uid()
    )
  );

-- INSERT: authenticated users can create opportunities (created_by must match)
CREATE POLICY "Users can create opportunities" ON opportunities
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND created_by = auth.uid()
  );

-- UPDATE: only creator can update their own opportunity
CREATE POLICY "Creators can update own opportunities" ON opportunities
  FOR UPDATE USING (
    created_by = auth.uid()
  );

-- DELETE: only creator can delete their own opportunity
CREATE POLICY "Creators can delete own opportunities" ON opportunities
  FOR DELETE USING (
    created_by = auth.uid()
  );

-- ─── OPPORTUNITY APPLICATIONS RLS ──────────────────────────

-- SELECT: applicants can view their own + creators can view applications to their opportunities
CREATE POLICY "Users can view relevant applications" ON opportunity_applications
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      applicant_id = auth.uid()
      OR opportunity_id IN (
        SELECT id FROM opportunities WHERE created_by = auth.uid()
      )
    )
  );

-- INSERT: applicants can submit only for themselves, only for internal opportunities
CREATE POLICY "Users can submit applications" ON opportunity_applications
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND applicant_id = auth.uid()
    AND opportunity_id IN (
      SELECT id FROM opportunities WHERE application_method = 'internal'
    )
  );

-- UPDATE: only opportunity creator can update application status
CREATE POLICY "Creators can update application status" ON opportunity_applications
  FOR UPDATE USING (
    opportunity_id IN (
      SELECT id FROM opportunities WHERE created_by = auth.uid()
    )
  );

-- DELETE: applicant can withdraw their own application
CREATE POLICY "Applicants can withdraw own applications" ON opportunity_applications
  FOR DELETE USING (
    applicant_id = auth.uid()
  );

-- ─── SAVED OPPORTUNITIES RLS ───────────────────────────────

-- SELECT: users can only see their own saved opportunities
CREATE POLICY "Users can view own saved opportunities" ON saved_opportunities
  FOR SELECT USING (
    auth.uid() = user_id
  );

-- INSERT: users can only save for themselves
CREATE POLICY "Users can save own opportunities" ON saved_opportunities
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );

-- DELETE: users can only remove their own saved opportunity
CREATE POLICY "Users can delete own saved opportunities" ON saved_opportunities
  FOR DELETE USING (
    auth.uid() = user_id
  );

COMMIT;
