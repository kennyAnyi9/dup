-- Add search vector column for full-text search
ALTER TABLE "paste" ADD COLUMN "search_vector" "tsvector";--> statement-breakpoint

-- Create GIN index for efficient full-text search
CREATE INDEX "idx_paste_search_vector" ON "paste" USING gin ("search_vector");--> statement-breakpoint

-- Create function to update search vector
CREATE OR REPLACE FUNCTION update_paste_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.language, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.content, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint

-- Create trigger to automatically update search vector
CREATE TRIGGER paste_search_vector_trigger
  BEFORE INSERT OR UPDATE ON "paste"
  FOR EACH ROW
  EXECUTE FUNCTION update_paste_search_vector();--> statement-breakpoint

-- Update existing records with search vectors
UPDATE "paste" SET search_vector = 
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(language, '')), 'C') ||
  setweight(to_tsvector('english', coalesce(content, '')), 'D');