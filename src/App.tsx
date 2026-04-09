import { useEffect, useState, type FormEvent } from "react";
import "./App.css";
import {
  type Artist,
  type Work,
  fetchArtists,
  fetchWorks,
} from "./services/artData";
import {
  type FavoriteState,
  fetchUserFavorites,
  setFavoriteArtist,
  setFavoriteWork,
} from "./services/favorites";
import { getSupabaseClient, isSupabaseConfigured } from "./lib/supabase";

type ActiveTab = "paintings" | "artists";
type AuthMode = "signin" | "signup";

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("paintings");
  const [works, setWorks] = useState<Work[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [statusMessage, setStatusMessage] = useState("");

  const [userId, setUserId] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const [favorites, setFavorites] = useState<FavoriteState>({
    favorite_artist: null,
    favorite_work: null,
  });
  const [favoriteSavingKey, setFavoriteSavingKey] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) {
      return;
    }

    client.auth
      .getSession()
      .then(({ data }) => {
        const nextUserId = data.session?.user.id ?? null;
        setUserId(nextUserId);
      })
      .catch(() => {
        setStatusMessage("Could not restore session.");
      });

    const { data } = client.auth.onAuthStateChange((_event, session) => {
      const nextUserId = session?.user.id ?? null;
      setUserId(nextUserId);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setStatusMessage(
        "Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to start loading data.",
      );
      return;
    }

    let isCancelled = false;

    const loadData = async () => {
      const [workRows, artistRows] = await Promise.all([
        fetchWorks(),
        fetchArtists(),
      ]);

      if (isCancelled) {
        return;
      }

      setWorks(workRows);
      setArtists(artistRows);

      if (workRows.length === 0 && artistRows.length === 0) {
        setStatusMessage(
          "No data rows yet. Load table data in Supabase during the workshop.",
        );
      } else {
        setStatusMessage("");
      }
    };

    loadData().catch(() => {
      if (!isCancelled) {
        setStatusMessage(
          "Could not fetch records yet. Continue wiring queries during the workshop.",
        );
      }
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      setFavorites({
        favorite_artist: null,
        favorite_work: null,
      });
      return;
    }

    fetchUserFavorites(userId)
      .then((favoriteState) => {
        setFavorites(favoriteState);
      })
      .catch(() => {
        setStatusMessage("Signed in, but could not read saved favorites yet.");
      });
  }, [userId]);

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const client = getSupabaseClient();
    if (!client) {
      setAuthError("Set Supabase environment keys before signing in.");
      return;
    }

    setAuthLoading(true);
    setAuthError("");

    const authAction =
      authMode === "signup"
        ? client.auth.signUp({ email, password })
        : client.auth.signInWithPassword({ email, password });

    const { data, error } = await authAction;
    setAuthLoading(false);

    if (error) {
      setAuthError(error.message);
      return;
    }

    const nextUserId = data.user?.id ?? data.session?.user.id ?? null;
    setUserId(nextUserId);
    setEmail("");
    setPassword("");
    setStatusMessage("");
  };

  const handleSignOut = async () => {
    const client = getSupabaseClient();
    if (!client) {
      return;
    }

    const { error } = await client.auth.signOut();
    if (error) {
      setStatusMessage("Could not sign out. Try again.");
      return;
    }

    setUserId(null);
    setStatusMessage("");
  };

  const saveArtistFavorite = async (artistId: number) => {
    if (!userId) {
      return;
    }

    setFavoriteSavingKey(`artist-${artistId}`);
    const errorMessage = await setFavoriteArtist(userId, artistId);
    setFavoriteSavingKey(null);

    if (errorMessage) {
      setStatusMessage(errorMessage);
      return;
    }

    setFavorites((current) => ({ ...current, favorite_artist: artistId }));
    setStatusMessage("Favorite artist saved.");
  };

  const saveWorkFavorite = async (workId: number) => {
    if (!userId) {
      return;
    }

    setFavoriteSavingKey(`work-${workId}`);
    const errorMessage = await setFavoriteWork(userId, workId);
    setFavoriteSavingKey(null);

    if (errorMessage) {
      setStatusMessage(errorMessage);
      return;
    }

    setFavorites((current) => ({ ...current, favorite_work: workId }));
    setStatusMessage("Favorite painting saved.");
  };

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <h1>Art Workshop Demo</h1>
          <p className="subtitle">
            Auth is prebuilt. Workshop focus is data + favorites.
          </p>
        </div>
        <div className="auth-area">
          {userId ? (
            <button className="button" onClick={handleSignOut} type="button">
              Sign out
            </button>
          ) : (
            <p className="subtitle">Signed out</p>
          )}
        </div>
      </header>

      {!userId ? (
        <section className="auth-panel" aria-label="Authentication form">
          <h2>{authMode === "signup" ? "Create account" : "Sign in"}</h2>
          <form onSubmit={handleAuthSubmit}>
            <label>
              Email
              <input
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </label>
            <label>
              Password
              <input
                autoComplete={
                  authMode === "signup" ? "new-password" : "current-password"
                }
                minLength={6}
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </label>
            {authError ? <p className="error-text">{authError}</p> : null}
            <div className="auth-actions">
              <button className="button" disabled={authLoading} type="submit">
                {authLoading
                  ? "Working..."
                  : authMode === "signup"
                    ? "Sign up"
                    : "Sign in"}
              </button>
              <button
                className="button button-alt"
                disabled={authLoading}
                onClick={() =>
                  setAuthMode((currentMode) =>
                    currentMode === "signup" ? "signin" : "signup",
                  )
                }
                type="button"
              >
                {authMode === "signup"
                  ? "Switch to sign in"
                  : "Switch to sign up"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <nav className="tabs" aria-label="Data views">
        <button
          className={activeTab === "paintings" ? "tab active" : "tab"}
          onClick={() => setActiveTab("paintings")}
          type="button"
        >
          Paintings
        </button>
        <button
          className={activeTab === "artists" ? "tab active" : "tab"}
          onClick={() => setActiveTab("artists")}
          type="button"
        >
          Artists
        </button>
      </nav>

      {statusMessage ? <p className="status-message">{statusMessage}</p> : null}

      <section className="table-wrapper">
        {activeTab === "paintings" ? (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Name</th>
                <th>Artist ID</th>
                <th>Favorite</th>
              </tr>
            </thead>
            <tbody>
              {works.length === 0 ? (
                <tr>
                  <td className="empty" colSpan={5}>
                    No paintings to display.
                  </td>
                </tr>
              ) : (
                works.map((work) => (
                  <tr key={work.work_id}>
                    <td>{work.work_id}</td>
                    <td>
                      {work.image_url ? (
                        <img
                          alt={work.name}
                          className="work-image"
                          loading="lazy"
                          src={work.image_url}
                        />
                      ) : (
                        <span className="empty-image">No image</span>
                      )}
                    </td>
                    <td>{work.name}</td>
                    <td>{work.artist_id}</td>
                    <td>
                      <button
                        className={
                          favorites.favorite_work === work.work_id
                            ? "favorite active"
                            : "favorite"
                        }
                        disabled={
                          !userId ||
                          favoriteSavingKey === `work-${work.work_id}`
                        }
                        onClick={() => saveWorkFavorite(work.work_id)}
                        type="button"
                      >
                        {favorites.favorite_work === work.work_id
                          ? "Favorited"
                          : "Favorite"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : null}

        {activeTab === "artists" ? (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Nationality</th>
                <th>Style</th>
                <th>Favorite</th>
              </tr>
            </thead>
            <tbody>
              {artists.length === 0 ? (
                <tr>
                  <td className="empty" colSpan={5}>
                    No artists to display.
                  </td>
                </tr>
              ) : (
                artists.map((artist) => (
                  <tr key={artist.artist_id}>
                    <td>{artist.artist_id}</td>
                    <td>{artist.full_name}</td>
                    <td>{artist.nationality || "-"}</td>
                    <td>{artist.style || "-"}</td>
                    <td>
                      <button
                        className={
                          favorites.favorite_artist === artist.artist_id
                            ? "favorite active"
                            : "favorite"
                        }
                        disabled={
                          !userId ||
                          favoriteSavingKey === `artist-${artist.artist_id}`
                        }
                        onClick={() => saveArtistFavorite(artist.artist_id)}
                        type="button"
                      >
                        {favorites.favorite_artist === artist.artist_id
                          ? "Favorited"
                          : "Favorite"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : null}
      </section>
    </main>
  );
}

export default App;
