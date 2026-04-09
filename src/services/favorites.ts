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

const readFavoriteRecord = async (userId: string) => {
  const client = getSupabaseClient();
  if (!client) {
    return { data: null, error: "Supabase is not configured." };
  }

  const byId = await client
    .from(tableName)
    .select("favorite_artist, favorite_work")
    .eq("id", userId)
    .maybeSingle();

  if (!byId.error) {
    return { data: byId.data, error: null };
  }

  const byUserId = await client
    .from(tableName)
    .select("favorite_artist, favorite_work")
    .eq("user_id", userId)
    .maybeSingle();

  return {
    data: byUserId.data,
    error: byUserId.error?.message ?? byId.error.message,
  };
};

const updateFavoriteRecord = async (
  userId: string,
  payload: Partial<FavoriteState>,
): Promise<string | null> => {
  const client = getSupabaseClient();
  if (!client) {
    return "Supabase is not configured.";
  }

  const updateById = await client
    .from(tableName)
    .update(payload)
    .eq("id", userId);
  if (!updateById.error) {
    return null;
  }

  const updateByUserId = await client
    .from(tableName)
    .update(payload)
    .eq("user_id", userId);

  if (!updateByUserId.error) {
    return null;
  }

  return updateByUserId.error.message;
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
