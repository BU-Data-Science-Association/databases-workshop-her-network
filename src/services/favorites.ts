import { getSupabaseClient } from "../lib/supabase";

export type FavoriteState = {
  favorite_artist: number | null;
  favorite_work: number | null;
};

const initialFavoriteState: FavoriteState = {
  favorite_artist: null,
  favorite_work: null,
};

const tableName = "user";

const ensureUserRow = async (userId: string): Promise<string | null> => {
  const client = getSupabaseClient();
  if (!client) {
    return "Supabase is not configured.";
  }

  const { error } = await client.from(tableName).upsert({ id: userId });
  return error ? error.message : null;
};

const readFavoriteRecord = async (userId: string) => {
  const client = getSupabaseClient();
  if (!client) {
    return { data: null, error: "Supabase is not configured." };
  }

  const ensureError = await ensureUserRow(userId);
  if (ensureError) {
    return { data: null, error: ensureError };
  }

  const result = await client
    .from(tableName)
    .select("favorite_artist, favorite_work")
    .eq("id", userId)
    .maybeSingle();

  if (result.error) {
    return { data: null, error: result.error.message };
  }

  return { data: result.data, error: null };
};

const updateFavoriteRecord = async (
  userId: string,
  payload: Partial<FavoriteState>,
): Promise<string | null> => {
  const client = getSupabaseClient();
  if (!client) {
    return "Supabase is not configured.";
  }

  const ensureError = await ensureUserRow(userId);
  if (ensureError) {
    return ensureError;
  }

  const { error } = await client
    .from(tableName)
    .update(payload)
    .eq("id", userId);

  if (!error) {
    return null;
  }

  return error.message;
};

export const fetchUserFavorites = async (
  userId: string,
): Promise<FavoriteState> => {
  const result = await readFavoriteRecord(userId);
  if (!result.data) {
    return initialFavoriteState;
  }

  return {
    favorite_artist: result.data.favorite_artist ?? null,
    favorite_work: result.data.favorite_work ?? null,
  };
};

export const setFavoriteArtist = async (userId: string, artistId: number) => {
  return updateFavoriteRecord(userId, { favorite_artist: artistId });
};

export const setFavoriteWork = async (userId: string, workId: number) => {
  return updateFavoriteRecord(userId, { favorite_work: workId });
};
