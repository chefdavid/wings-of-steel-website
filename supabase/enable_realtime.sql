-- Enable realtime for the team_roster table
ALTER PUBLICATION supabase_realtime ADD TABLE team_roster;

-- You can verify it's enabled by running:
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';