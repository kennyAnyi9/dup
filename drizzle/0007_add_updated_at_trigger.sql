-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for comment table
CREATE TRIGGER set_comment_updated_at
    BEFORE UPDATE ON comment
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for paste table (if not already exists)
DROP TRIGGER IF EXISTS set_paste_updated_at ON paste;
CREATE TRIGGER set_paste_updated_at
    BEFORE UPDATE ON paste
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for user table (if not already exists)
DROP TRIGGER IF EXISTS set_user_updated_at ON "user";
CREATE TRIGGER set_user_updated_at
    BEFORE UPDATE ON "user"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for tag table (if not already exists)
DROP TRIGGER IF EXISTS set_tag_updated_at ON tag;
CREATE TRIGGER set_tag_updated_at
    BEFORE UPDATE ON tag
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();