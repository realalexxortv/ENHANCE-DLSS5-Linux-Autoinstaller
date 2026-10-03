import { useMemo, useState } from "react";
import {
  Check,
  ChevronLeft,
  Copy,
  Download,
  RefreshCw,
  Search,
  ShieldAlert,
} from "lucide-react";
import {
  AGENT_ORIGIN,
  DEMO_GAMES,
  PACK,
  type Filter,
  type Game,
  type Hook,
  apiLabel,
  compatibilityNotes,
  isReady,
  isSkipped,
  launchOptions,
  packLines,
} from "@/lib/forge/model";

type Mode = "demo" | "live";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "ready", label: "Ready" },
  { id: "all", label: "All" },
  { id: "installed", label: "Installed" },
  { id: "skipped", label: "Skipped" },
];

const HOOKS: Hook[] = ["dxgi", "d3d11", "d3d12"];

export function ForgeApp() {
  const [mode, setMode] = useState<Mode>("demo");
  const [games, setGames] = useState<Game[]>(DEMO_GAMES);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [filter, setFilter] = useState<Filter>("ready");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(DEMO_GAMES[0]?.appid ?? "");
  const [showDetail, setShowDetail] = useState(false);
  const [hook, setHook] = useState<Hook>("dxgi");
  const [overwrite, setOverwrite] = useState(false);
  const [ack, setAck] = useState(false);
  const [showLauncher, setShowLauncher] = useState(false);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string[] | null>(null);
  const [copied, setCopied] = useState(false);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return games.filter((game) => {
      if (q && !game.name.toLowerCase().includes(q)) return false;
      if (filter === "ready") return isReady(game) && !game.anticheat;
      if (filter === "installed") return game.installedByForge;
      if (filter === "skipped") return isSkipped(game);
      return true;
    });
  }, [games, filter, query]);

  const selected = games.find((game) => game.appid === selectedId) ?? visible[0] ?? null;

  function selectGame(game: Game) {
    setSelectedId(game.appid);
    setHook(game.hook ?? "dxgi");
    setOverwrite(false);
    setAck(false);
    setLog(null);
    setCopied(false);
    setShowDetail(true);
  }

  async function connect(options?: { preserveLog?: boolean }) {
    setConnecting(true);
    setConnectError(null);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 1200);
    try {
      const health = await fetch(`${AGENT_ORIGIN}/api/health`, { signal: ctrl.signal });
      if (!health.ok) throw new Error("Forge did not answer.");
      const res = await fetch(`${AGENT_ORIGIN}/api/games`, { signal: ctrl.signal });
      if (!res.ok) throw new Error("Could not read the Steam library.");
      const data = (await res.json()) as { games?: Game[]; warnings?: string[] };
      const next = data.games ?? [];
      setGames(next);
      setWarnings(data.warnings ?? []);
      setMode("live");
      setSelectedId((current) => (next.some((game) => game.appid === current) ? current : (next[0]?.appid ?? "")));
      setShowDetail(true);
      if (!options?.preserveLog) setLog(null);
    } catch {
      setConnectError(
        "No Forge app is running on this computer yet. Download it, open it, then connect again.",
      );
    } finally {
      clearTimeout(timer);
      setConnecting(false);
    }
  }

  async function refreshLive() {
    if (mode !== "live") return;
    await connect();
  }

  function simulateInstall(game: Game) {
    const lines = [
      `${game.name} · ${apiLabel(game.api)} · 64-bit`,
      `Executable folder: ${game.exe ? game.exe.slice(0, game.exe.lastIndexOf("/")) : game.installDir}`,
      "Would download ReShade 6.8.0 add-on setup from reshade.me",
      `Would download ${PACK.shortfuse}`,
      `Would download ${PACK.neural}`,
      game.hasDlss && !overwrite
        ? "Game already ships DLSS. Those DLLs would be left alone."
        : `Would download ${PACK.streamline}`,
      "Would write ReShade.ini with LoadFromDllMain=renodx-dlss.addon64",
      `Steam launch option: ${launchOptions(hook)}`,
      "Sample library only — nothing was written. Open the Linux app to install into a real game folder.",
    ];
    setLog(lines);
    setGames((current) =>
      current.map((item) =>
        item.appid === game.appid ? { ...item, installedByForge: true, hook } : item,
      ),
    );
  }

  async function install(game: Game) {
    if (mode === "demo") {
      simulateInstall(game);
      return;
    }
    setBusy(true);
    setLog(["Starting install…"]);
    const body: Record<string, unknown> = {
      appid: game.appid,
      hook,
      overwriteDlss: overwrite,
      confirmAnticheat: ack,
    };
    if (game.api === "unknown") body.apiOverride = hook === "d3d11" ? "dx11" : "dx12";
    try {
      const res = await fetch(`${AGENT_ORIGIN}/api/install`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        setLog([err.error ?? "Install did not start."]);
        setBusy(false);
        return;
      }
      await pollJob();
    } catch {
      setLog(["Lost contact with the Forge app."]);
      setBusy(false);
    }
  }

  async function pollJob() {
    for (let i = 0; i < 600; i += 1) {
      const res = await fetch(`${AGENT_ORIGIN}/api/job`);
      const job = (await res.json()) as {
        running?: boolean;
        lines?: string[];
        error?: string | null;
        done?: boolean;
      };
      setLog(job.lines ?? []);
      if (!job.running && job.done) {
        setBusy(false);
        await connect({ preserveLog: true });
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
    setBusy(false);
  }

  async function remove(game: Game) {
    if (mode === "demo") {
      setGames((current) =>
        current.map((item) =>
          item.appid === game.appid ? { ...item, installedByForge: false, hook: null } : item,
        ),
      );
      setLog(["Sample only. The install marker was cleared in this preview."]);
      return;
    }
    const res = await fetch(`${AGENT_ORIGIN}/api/remove`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appid: game.appid }),
    });
    const data = (await res.json()) as { error?: string; removed?: string[] };
    if (!res.ok) {
      setLog([data.error ?? "Could not remove."]);
      return;
    }
    setLog([`Removed ${data.removed?.join(", ") || "Forge files"}. Backups were kept.`]);
    await connect({ preserveLog: true });
  }

  async function copyLaunch(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const canInstall = Boolean(
    selected &&
      selected.exe &&
      selected.bits !== 32 &&
      (selected.api === "dx11" || selected.api === "dx12" || selected.api === "unknown") &&
      !busy,
  );

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pt-8 pb-2 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs tracking-widest text-subtle">LINUX · STEAM · PROTON</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Forge</h1>
          <p className="mt-3 max-w-xl text-base text-muted">
            Pick a Steam game. Forge packs ReShade 6.8.0, the ShortFuse DLSS add-on, and the
            NVIDIA files into the Windows build so Proton can run DLSS 5.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowLauncher((open) => !open)}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold text-accent-fg"
          >
            <Download className="size-4" aria-hidden="true" />
            Get the Linux app
          </button>
          <button
            type="button"
            onClick={() => void (mode === "live" ? refreshLive() : connect())}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-4 text-sm text-fg"
          >
            <RefreshCw className={`size-4 ${connecting ? "animate-spin" : ""}`} aria-hidden="true" />
            {mode === "live" ? "Rescan Steam" : "Connect local app"}
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <p
          className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
            mode === "live" ? "border-line text-ok" : "border-line text-muted"
          }`}
        >
          {mode === "live"
            ? "Connected. This list is the Steam library on this computer."
            : "Sample library, so you can see the install before anything is on disk. Download the Linux app to scan your real Steam folders."}
        </p>
        {connectError ? <p className="mt-2 text-sm text-bad">{connectError}</p> : null}
        {warnings.map((warning) => (
          <p key={warning} className="mt-2 text-sm text-warn">
            {warning}
          </p>
        ))}

        {showLauncher ? (
          <section className="mt-4 rounded-xl border border-line bg-surface p-4 sm:p-5">
            <h2 className="text-lg font-semibold">Run Forge on Linux</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted">
              <li>Download the single file. It is the app, not an installer that needs root.</li>
              <li>
                In the file manager, open Properties and allow executing the file, then open it.
                A browser window lists the games Steam has installed.
              </li>
              <li>
                Works on Arch, CachyOS, Fedora, Debian, and other glibc systems that already have
                python3. Flatpak Steam and Snap Steam are included.
              </li>
            </ol>
            <a
              href="/ForgeDLSS5.run"
              download="ForgeDLSS5.run"
              className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold text-accent-fg"
            >
              <Download className="size-4" aria-hidden="true" />
              Download ForgeDLSS5.run
            </a>
            <p className="mt-3 text-sm text-subtle">
              The file is a real launcher, not a disk image. An AppImage would need FUSE, which
              CachyOS and some Arch installs do not ship. This one does not.
            </p>
          </section>
        ) : null}
      </div>

      <main className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:py-6">
        <section className={`${showDetail ? "hidden lg:block" : ""} rounded-xl border border-line bg-surface p-3`}>
          <label className="flex h-11 items-center gap-2 rounded-full border border-line bg-surface-2 px-3">
            <Search className="size-4 text-subtle" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter games"
              className="w-full bg-transparent text-sm outline-none placeholder:text-subtle"
              aria-label="Filter games"
            />
          </label>
          <div className="mt-3 flex flex-wrap gap-2" role="toolbar" aria-label="Library filters">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={filter === item.id}
                onClick={() => setFilter(item.id)}
                className={`h-9 rounded-full px-3 text-sm ${
                  filter === item.id ? "bg-accent text-accent-fg" : "border border-line text-muted"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="mt-2 max-h-screen overflow-auto" role="listbox" aria-label="Games">
            {visible.length === 0 ? (
              <p className="px-2 py-6 text-sm text-muted">Nothing in this filter.</p>
            ) : (
              visible.map((game) => (
                <button
                  key={game.appid}
                  type="button"
                  role="option"
                  aria-selected={selected?.appid === game.appid}
                  onClick={() => selectGame(game)}
                  className={`flex w-full flex-col gap-1 rounded-md px-3 py-3 text-left ${
                    selected?.appid === game.appid ? "bg-surface-2" : "hover:bg-surface-2"
                  }`}
                >
                  <span className="font-semibold">{game.name}</span>
                  <Pills game={game} />
                  <span className="truncate font-mono text-xs text-subtle">
                    {game.exeRelative ?? game.installDir}
                  </span>
                </button>
              ))
            )}
          </div>
        </section>

        <section className={`${showDetail ? "" : "hidden lg:block"} rounded-xl border border-line bg-surface p-4 sm:p-5`}>
          {selected ? (
            <Detail
              game={selected}
              hook={hook}
              overwrite={overwrite}
              ack={ack}
              busy={busy}
              copied={copied}
              log={log}
              canInstall={canInstall}
              mode={mode}
              onBack={() => setShowDetail(false)}
              onHook={setHook}
              onOverwrite={setOverwrite}
              onAck={setAck}
              onInstall={() => void install(selected)}
              onRemove={() => void remove(selected)}
              onCopy={() => void copyLaunch(launchOptions(hook))}
            />
          ) : (
            <p className="text-sm text-muted">No game selected.</p>
          )}
        </section>
      </main>
    </div>
  );
}

function Pills({ game }: { game: Game }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      <span className="rounded-full border border-line px-2 py-0.5 text-xs text-muted">{apiLabel(game.api)}</span>
      <span className="rounded-full border border-line px-2 py-0.5 text-xs text-muted">
        {game.bits ? `${game.bits}-bit` : "bitness unknown"}
      </span>
      {game.hasDlss ? (
        <span className="rounded-full border border-line px-2 py-0.5 text-xs text-ok">ships DLSS</span>
      ) : null}
      {game.installedByForge ? (
        <span className="rounded-full border border-line px-2 py-0.5 text-xs text-ok">Forge installed</span>
      ) : null}
      {game.anticheat ? (
        <span className="rounded-full border border-line px-2 py-0.5 text-xs text-bad">anti-cheat</span>
      ) : null}
      {game.steamKind !== "native" ? (
        <span className="rounded-full border border-line px-2 py-0.5 text-xs text-muted">{game.steamKind}</span>
      ) : null}
    </span>
  );
}

function Detail({
  game,
  hook,
  overwrite,
  ack,
  busy,
  copied,
  log,
  canInstall,
  mode,
  onBack,
  onHook,
  onOverwrite,
  onAck,
  onInstall,
  onRemove,
  onCopy,
}: {
  game: Game;
  hook: Hook;
  overwrite: boolean;
  ack: boolean;
  busy: boolean;
  copied: boolean;
  log: string[] | null;
  canInstall: boolean;
  mode: Mode;
  onBack: () => void;
  onHook: (hook: Hook) => void;
  onOverwrite: (value: boolean) => void;
  onAck: (value: boolean) => void;
  onInstall: () => void;
  onRemove: () => void;
  onCopy: () => void;
}) {
  const blocked = Boolean(game.anticheat) && !ack;
  const launch = launchOptions(hook);
  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-3 inline-flex h-10 items-center gap-1 text-sm text-muted lg:hidden"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        All games
      </button>
      <h2 className="text-2xl font-semibold tracking-tight">{game.name}</h2>
      <div className="mt-2">
        <Pills game={game} />
      </div>
      <p className="mt-3 font-mono text-xs break-all text-muted">{game.installDir}</p>
      {game.exeRelative ? <p className="font-mono text-xs break-all text-subtle">{game.exeRelative}</p> : null}
      {game.unsupportedReason && game.api !== "dx11" && game.api !== "dx12" ? (
        <p className="mt-3 text-sm text-warn">{game.unsupportedReason}</p>
      ) : null}
      {game.api === "unknown" ? (
        <p className="mt-3 text-sm text-warn">
          {game.unsupportedReason} Choosing d3d11.dll treats it as DX11. dxgi.dll or d3d12.dll treats it as DX12.
        </p>
      ) : null}

      <div className="mt-5">
        <p className="text-xs tracking-wider text-subtle uppercase">Hook</p>
        <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="ReShade hook DLL">
          {HOOKS.map((item) => (
            <button
              key={item}
              type="button"
              role="radio"
              aria-checked={hook === item}
              onClick={() => onHook(item)}
              className={`h-9 rounded-full px-3 text-sm ${
                hook === item ? "bg-accent text-accent-fg" : "border border-line text-muted"
              }`}
            >
              {item}.dll
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs tracking-wider text-subtle uppercase">What gets packed</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
          {packLines(game, hook, overwrite).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-subtle">
          There is no public ShortFuse build named v7. Forge uses the current add-on, SF 26.0928.0205,
          and the patched neural DLL 310.8.SF-v2. To force a file you already have, put
          renodx-dlss.addon64 or nvngx_dlssnr.dll in ~/.local/share/forge-dlss5/payload before installing.
        </p>
      </div>

      <label className="mt-4 flex items-start gap-2 text-sm text-muted">
        <input
          type="checkbox"
          className="mt-1 size-4"
          checked={overwrite}
          onChange={(event) => onOverwrite(event.target.checked)}
        />
        Overwrite the game's DLSS and Streamline DLLs. Previous files are copied into
        .forge-dlss5-backup first.
      </label>

      {game.anticheat ? (
        <label className="mt-3 flex items-start gap-2 text-sm text-bad">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            <input
              type="checkbox"
              className="mr-2 size-4 align-middle"
              checked={ack}
              onChange={(event) => onAck(event.target.checked)}
            />
            This folder looks like {game.anticheat}. I accept that the game may refuse to start or
            ban the account.
          </span>
        </label>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!canInstall || blocked}
          onClick={onInstall}
          className="h-11 rounded-full bg-accent px-4 text-sm font-semibold text-accent-fg disabled:opacity-40"
        >
          {busy ? "Installing…" : game.installedByForge ? "Reinstall DLSS 5" : "Install DLSS 5"}
        </button>
        {game.installedByForge ? (
          <button
            type="button"
            onClick={onRemove}
            className="h-11 rounded-full border border-line px-4 text-sm"
          >
            Remove Forge files
          </button>
        ) : null}
      </div>
      {mode === "demo" ? (
        <p className="mt-2 text-xs text-subtle">
          Install here walks the real file plan against the sample. It does not download or write
          anything.
        </p>
      ) : null}

      <div className="mt-5">
        <p className="text-xs tracking-wider text-subtle uppercase">Steam launch option</p>
        <div className="mt-2 flex items-start gap-2 rounded-md bg-bg p-3">
          <code className="min-w-0 flex-1 font-mono text-xs break-all text-fg">{launch}</code>
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full border border-line px-3 text-xs"
          >
            {copied ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs tracking-wider text-subtle uppercase">Compatibility</p>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-muted">
          {compatibilityNotes(game, hook).map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>

      {log ? (
        <div className="mt-5">
          <p className="text-xs tracking-wider text-subtle uppercase">Log</p>
          <pre className="mt-2 max-h-56 overflow-auto rounded-md bg-bg p-3 font-mono text-xs whitespace-pre-wrap text-muted">
            {log.join("\n")}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
