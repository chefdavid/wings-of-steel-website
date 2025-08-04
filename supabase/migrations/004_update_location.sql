-- Update hero section to reference New Jersey instead of Michigan
UPDATE site_sections 
SET content = jsonb_set(
  content, 
  '{description}', 
  '"New Jersey''s premier youth sled hockey team, building champions on and off the ice"'
)
WHERE section_key = 'hero';