-- Normalize all existing emails to lowercase
UPDATE users SET email = LOWER(TRIM(email)) WHERE email != LOWER(TRIM(email));

-- Add a check constraint to ensure emails are always lowercase
ALTER TABLE users ADD CONSTRAINT email_lowercase CHECK (email = LOWER(email));

-- Add a check constraint to ensure emails are trimmed (no leading/trailing spaces)
ALTER TABLE users ADD CONSTRAINT email_trimmed CHECK (email = TRIM(email));
