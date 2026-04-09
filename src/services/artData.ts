import { getSupabaseClient } from "../lib/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

export type Artist = {
  artist_id: number;
  full_name: string;
  nationality: string | null;
  style: string | null;
};

export type Work = {
  work_id: number;
  name: string;
  artist_id: number;
  image_url: string | null;
};

type ArtistRow = {
  artist_id: number;
  full_name: string;
  nationality: string | null;
  style: string | null;
};

type WorkRow = {
  work_id: number;
  name: string;
  artist_id: number;
};

type ImageLinkRow = {
  work_id: number;
  thumbnail_small_url: string | null;
  thumbnail_large_url: string | null;
  url: string | null;
};

const getClient = (): SupabaseClient | null => {
  return getSupabaseClient();
};

const fetchArtistRows = async (
  client: SupabaseClient,
): Promise<ArtistRow[]> => {
  const { data, error } = await client
    .from("artist")
    .select("artist_id, full_name, nationality, style")
    .order("artist_id", { ascending: true })
    .limit(200);

  if (error) {
    return [];
  }

  return (data as ArtistRow[] | null) ?? [];
};

const fetchWorkRows = async (client: SupabaseClient): Promise<WorkRow[]> => {
  const { data, error } = await client
    .from("work")
    .select("work_id, name, artist_id")
    .order("work_id", { ascending: true })
    .limit(200);

  if (error) {
    return [];
  }

  return (data as WorkRow[] | null) ?? [];
};

const fetchImageLinkRows = async (
  client: SupabaseClient,
): Promise<ImageLinkRow[]> => {
  const { data, error } = await client
    .from("image_link")
    .select("work_id, thumbnail_small_url, thumbnail_large_url, url")
    .limit(200);

  if (error) {
    return [];
  }

  return (data as ImageLinkRow[] | null) ?? [];
};

// Build a quick lookup table so each work can resolve its display image by work_id.
const buildImageLookup = (imageRows: ImageLinkRow[]): Map<number, string> => {
  const imageMap = new Map<number, string>();
  imageRows.forEach((row) => {
    const preferredImage =
      row.thumbnail_small_url ?? row.thumbnail_large_url ?? row.url;
    if (preferredImage) {
      imageMap.set(row.work_id, preferredImage);
    }
  });
  return imageMap;
};

const mergeWorksWithImages = (
  works: WorkRow[],
  imageMap: Map<number, string>,
): Work[] => {
  return works.map((work) => ({
    work_id: work.work_id,
    name: work.name,
    artist_id: work.artist_id,
    image_url: imageMap.get(work.work_id) ?? null,
  }));
};

export const fetchArtists = async (): Promise<Artist[]> => {
  const client = getClient();
  if (!client) {
    return [];
  }

  return fetchArtistRows(client);
};

export const fetchWorks = async (): Promise<Work[]> => {
  const client = getClient();
  if (!client) {
    return [];
  }

  const [works, imageLinks] = await Promise.all([
    fetchWorkRows(client),
    fetchImageLinkRows(client),
  ]);

  const imageMap = buildImageLookup(imageLinks);
  return mergeWorksWithImages(works, imageMap);
};
