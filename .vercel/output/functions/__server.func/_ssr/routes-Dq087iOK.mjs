import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Download, c as Check, i as RefreshCw, n as ShieldAlert, o as Copy, r as Search, s as ChevronLeft } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Dq087iOK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PACK = {
	reshade: "ReShade 6.8.0 with full add-on support",
	shortfuse: "ShortFuse renodx-dlss.addon64 · SF 26.0928.0205",
	neural: "NVIDIA nvngx_dlssnr.dll · 310.8.SF-v2",
	streamline: "NVIDIA Streamline runtime (nvngx_dlss.dll, nvngx_dlssg.dll, sl.interposer.dll and the sl.*.dll set)"
};
var AGENT_ORIGIN = "http://127.0.0.1:4775";
var sample = (partial) => partial;
var DEMO_GAMES = [
	sample({
		appid: "1091500",
		name: "Cyberpunk 2077",
		library: "/home/you/.local/share/Steam",
		installDir: "/home/you/.local/share/Steam/steamapps/common/Cyberpunk 2077",
		exe: "/home/you/.local/share/Steam/steamapps/common/Cyberpunk 2077/bin/x64/Cyberpunk2077.exe",
		exeRelative: "bin/x64/Cyberpunk2077.exe",
		api: "dx12",
		bits: 64,
		hasDlss: true,
		dlssPath: "/home/you/.local/share/Steam/steamapps/common/Cyberpunk 2077/bin/x64/nvngx_dlss.dll",
		anticheat: null,
		installedByForge: false,
		hook: null,
		steamKind: "native",
		unsupportedReason: null
	}),
	sample({
		appid: "292030",
		name: "The Witcher 3: Wild Hunt",
		library: "/home/you/.local/share/Steam",
		installDir: "/home/you/.local/share/Steam/steamapps/common/The Witcher 3",
		exe: "/home/you/.local/share/Steam/steamapps/common/The Witcher 3/bin/x64_dx12/witcher3.exe",
		exeRelative: "bin/x64_dx12/witcher3.exe",
		api: "dx12",
		bits: 64,
		hasDlss: true,
		dlssPath: "/home/you/.local/share/Steam/steamapps/common/The Witcher 3/bin/x64_dx12/nvngx_dlss.dll",
		anticheat: null,
		installedByForge: true,
		hook: "dxgi",
		steamKind: "native",
		unsupportedReason: null
	}),
	sample({
		appid: "1245620",
		name: "ELDEN RING",
		library: "/home/you/.local/share/Steam",
		installDir: "/home/you/.local/share/Steam/steamapps/common/ELDEN RING/Game",
		exe: "/home/you/.local/share/Steam/steamapps/common/ELDEN RING/Game/eldenring.exe",
		exeRelative: "Game/eldenring.exe",
		api: "dx12",
		bits: 64,
		hasDlss: false,
		dlssPath: null,
		anticheat: null,
		installedByForge: false,
		hook: null,
		steamKind: "native",
		unsupportedReason: null
	}),
	sample({
		appid: "1086940",
		name: "Baldur's Gate 3",
		library: "/home/you/.local/share/Steam",
		installDir: "/home/you/.local/share/Steam/steamapps/common/Baldurs Gate 3/bin",
		exe: "/home/you/.local/share/Steam/steamapps/common/Baldurs Gate 3/bin/bg3.exe",
		exeRelative: "bin/bg3.exe",
		api: "dx11",
		bits: 64,
		hasDlss: false,
		dlssPath: null,
		anticheat: null,
		installedByForge: false,
		hook: null,
		steamKind: "native",
		unsupportedReason: null
	}),
	sample({
		appid: "1593500",
		name: "God of War",
		library: "/home/you/.local/share/Steam",
		installDir: "/home/you/.local/share/Steam/steamapps/common/God of War",
		exe: "/home/you/.local/share/Steam/steamapps/common/God of War/GoW.exe",
		exeRelative: "GoW.exe",
		api: "dx11",
		bits: 64,
		hasDlss: true,
		dlssPath: "/home/you/.local/share/Steam/steamapps/common/God of War/nvngx_dlss.dll",
		anticheat: null,
		installedByForge: false,
		hook: null,
		steamKind: "native",
		unsupportedReason: null
	}),
	sample({
		appid: "2358720",
		name: "Black Myth: Wukong",
		library: "/mnt/games",
		installDir: "/mnt/games/steamapps/common/BlackMythWukong",
		exe: "/mnt/games/steamapps/common/BlackMythWukong/b1/Binaries/Win64/b1-Win64-Shipping.exe",
		exeRelative: "b1/Binaries/Win64/b1-Win64-Shipping.exe",
		api: "dx12",
		bits: 64,
		hasDlss: true,
		dlssPath: "/mnt/games/steamapps/common/BlackMythWukong/b1/Binaries/Win64/nvngx_dlss.dll",
		anticheat: null,
		installedByForge: false,
		hook: null,
		steamKind: "native",
		unsupportedReason: null
	}),
	sample({
		appid: "548430",
		name: "Deep Rock Galactic",
		library: "/home/you/.local/share/Steam",
		installDir: "/home/you/.local/share/Steam/steamapps/common/Deep Rock Galactic",
		exe: "/home/you/.local/share/Steam/steamapps/common/Deep Rock Galactic/FSD/Binaries/Win64/FSD-Win64-Shipping.exe",
		exeRelative: "FSD/Binaries/Win64/FSD-Win64-Shipping.exe",
		api: "dx11",
		bits: 64,
		hasDlss: false,
		dlssPath: null,
		anticheat: null,
		installedByForge: false,
		hook: null,
		steamKind: "flatpak",
		unsupportedReason: null
	}),
	sample({
		appid: "2073850",
		name: "THE FINALS",
		library: "/home/you/.local/share/Steam",
		installDir: "/home/you/.local/share/Steam/steamapps/common/The Finals",
		exe: "/home/you/.local/share/Steam/steamapps/common/The Finals/Discovery.exe",
		exeRelative: "Discovery.exe",
		api: "dx12",
		bits: 64,
		hasDlss: true,
		dlssPath: null,
		anticheat: "easyanticheat",
		installedByForge: false,
		hook: null,
		steamKind: "native",
		unsupportedReason: null
	}),
	sample({
		appid: "275850",
		name: "No Man's Sky",
		library: "/home/you/.local/share/Steam",
		installDir: "/home/you/.local/share/Steam/steamapps/common/No Man's Sky/Binaries",
		exe: "/home/you/.local/share/Steam/steamapps/common/No Man's Sky/Binaries/NMS.exe",
		exeRelative: "Binaries/NMS.exe",
		api: "vulkan",
		bits: 64,
		hasDlss: false,
		dlssPath: null,
		anticheat: null,
		installedByForge: false,
		hook: null,
		steamKind: "native",
		unsupportedReason: "Detected vulkan. Vulkan and OpenGL are not hooked by this pack."
	}),
	sample({
		appid: "730",
		name: "Counter-Strike 2",
		library: "/home/you/.local/share/Steam",
		installDir: "/home/you/.local/share/Steam/steamapps/common/Counter-Strike Global Offensive",
		exe: "/home/you/.local/share/Steam/steamapps/common/Counter-Strike Global Offensive/game/bin/win64/cs2.exe",
		exeRelative: "game/bin/win64/cs2.exe",
		api: "vulkan",
		bits: 64,
		hasDlss: false,
		dlssPath: null,
		anticheat: "vac",
		installedByForge: false,
		hook: null,
		steamKind: "native",
		unsupportedReason: "Detected vulkan. Vulkan and OpenGL are not hooked by this pack."
	})
];
function isReady(game) {
	return (game.api === "dx11" || game.api === "dx12") && game.bits !== 32 && Boolean(game.exe);
}
function isSkipped(game) {
	return !isReady(game) || Boolean(game.anticheat);
}
function launchOptions(hook) {
	return `WINEDLLOVERRIDES="${hook}=n,b" PROTON_ENABLE_NVAPI=1 %command%`;
}
function packLines(game, hook, overwrite) {
	const lines = [
		`${hook}.dll — ReShade 6.8.0 add-on build, renamed from ReShade64.dll`,
		"renodx-dlss.addon64 — ShortFuse DLSS add-on, SF 26.0928.0205",
		"nvngx_dlssnr.dll — NVIDIA neural runtime 310.8.SF-v2 (RTX 20 through 50)",
		"ReShade.ini — LoadFromDllMain=renodx-dlss.addon64, Unix line endings"
	];
	if (!game.hasDlss || overwrite) lines.push("nvngx_dlss.dll, nvngx_dlssg.dll, sl.interposer.dll, and the rest of the Streamline set");
	else lines.push("The game's own DLSS and Streamline files stay where they are");
	if (game.hasDlss && game.dlssPath && !game.dlssPath.endsWith(`${hook}.dll`)) lines.push("nvngx_dlssnr.dll is also copied beside the game's existing nvngx_dlss.dll");
	return lines;
}
function compatibilityNotes(game, hook) {
	return [
		"Steam → the game → Properties → Compatibility. Check “Force the use of a specific Steam Play compatibility tool”. Choose Proton Experimental, GE-Proton, or on CachyOS proton-cachyos / proton-ge-custom. Skip Proton 8 and older.",
		"Paste the launch option into Properties → General → Launch Options, including %command%.",
		"NVIDIA's proprietary driver and an RTX 20, 30, 40, or 50. Nouveau will not run DLSS. 310.8.SF-v2 is the patched ShortFuse neural DLL for that whole range.",
		"The pack targets the Windows executable. If Steam would start a native Linux build, the compatibility checkbox is what forces Proton.",
		game.api === "dx11" || hook === "d3d11" ? "DX11: dxgi.dll is the usual Proton hook. If the game closes before the menu, switch to d3d11.dll and copy the launch option again." : "DX12: dxgi.dll is the usual Proton hook. A black image with the ReShade overlay still up means switch to d3d12.dll. Use Proton Experimental, GE-Proton, or CachyOS proton-cachyos so vkd3d-proton understands the ReShade 6.8 add-on.",
		"In the game, press Home. Open Add-ons and turn on RenoDX DLSS / Neural Rendering. Games that did not ship DLSS need Hook Method set to On Present and Require DLSS set to Off.",
		"Single-player only. Easy Anti-Cheat, BattlEye, Vanguard, and VAC can refuse to start or ban the account. Forge will not install those quietly.",
		game.steamKind === "flatpak" ? "This copy is the Flatpak version of Steam. Forge still writes into that library. The launch option is the same." : game.steamKind === "snap" ? "This copy is the Snap version of Steam. Forge still writes into that library. The launch option is the same." : "Native, Flatpak, and Snap Steam are all scanned. The launch option does not change between them.",
		"No root. The Linux file needs python3, which Arch, CachyOS, Fedora, and Debian already have. The first install downloads ReShade, the ShortFuse add-on, and the NVIDIA files, and unpacks ReShade with 7-Zip (downloaded if it is not installed)."
	];
}
function apiLabel(api) {
	if (api === "dx11") return "DX11";
	if (api === "dx12") return "DX12";
	if (api === "dx9") return "DX9";
	if (api === "vulkan") return "Vulkan";
	if (api === "opengl") return "OpenGL";
	return "API unknown";
}
var FILTERS = [
	{
		id: "ready",
		label: "Ready"
	},
	{
		id: "all",
		label: "All"
	},
	{
		id: "installed",
		label: "Installed"
	},
	{
		id: "skipped",
		label: "Skipped"
	}
];
var HOOKS = [
	"dxgi",
	"d3d11",
	"d3d12"
];
function ForgeApp() {
	const [mode, setMode] = (0, import_react.useState)("demo");
	const [games, setGames] = (0, import_react.useState)(DEMO_GAMES);
	const [warnings, setWarnings] = (0, import_react.useState)([]);
	const [connectError, setConnectError] = (0, import_react.useState)(null);
	const [connecting, setConnecting] = (0, import_react.useState)(false);
	const [filter, setFilter] = (0, import_react.useState)("ready");
	const [query, setQuery] = (0, import_react.useState)("");
	const [selectedId, setSelectedId] = (0, import_react.useState)(DEMO_GAMES[0]?.appid ?? "");
	const [showDetail, setShowDetail] = (0, import_react.useState)(false);
	const [hook, setHook] = (0, import_react.useState)("dxgi");
	const [overwrite, setOverwrite] = (0, import_react.useState)(false);
	const [ack, setAck] = (0, import_react.useState)(false);
	const [showLauncher, setShowLauncher] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [log, setLog] = (0, import_react.useState)(null);
	const [copied, setCopied] = (0, import_react.useState)(false);
	const visible = (0, import_react.useMemo)(() => {
		const q = query.trim().toLowerCase();
		return games.filter((game) => {
			if (q && !game.name.toLowerCase().includes(q)) return false;
			if (filter === "ready") return isReady(game) && !game.anticheat;
			if (filter === "installed") return game.installedByForge;
			if (filter === "skipped") return isSkipped(game);
			return true;
		});
	}, [
		games,
		filter,
		query
	]);
	const selected = games.find((game) => game.appid === selectedId) ?? visible[0] ?? null;
	function selectGame(game) {
		setSelectedId(game.appid);
		setHook(game.hook ?? "dxgi");
		setOverwrite(false);
		setAck(false);
		setLog(null);
		setCopied(false);
		setShowDetail(true);
	}
	async function connect(options) {
		setConnecting(true);
		setConnectError(null);
		const ctrl = new AbortController();
		const timer = setTimeout(() => ctrl.abort(), 1200);
		try {
			if (!(await fetch(`http://127.0.0.1:4775/api/health`, { signal: ctrl.signal })).ok) throw new Error("Forge did not answer.");
			const res = await fetch(`${AGENT_ORIGIN}/api/games`, { signal: ctrl.signal });
			if (!res.ok) throw new Error("Could not read the Steam library.");
			const data = await res.json();
			const next = data.games ?? [];
			setGames(next);
			setWarnings(data.warnings ?? []);
			setMode("live");
			setSelectedId((current) => next.some((game) => game.appid === current) ? current : next[0]?.appid ?? "");
			setShowDetail(true);
			if (!options?.preserveLog) setLog(null);
		} catch {
			setConnectError("No Forge app is running on this computer yet. Download it, open it, then connect again.");
		} finally {
			clearTimeout(timer);
			setConnecting(false);
		}
	}
	async function refreshLive() {
		if (mode !== "live") return;
		await connect();
	}
	function simulateInstall(game) {
		const lines = [
			`${game.name} · ${apiLabel(game.api)} · 64-bit`,
			`Executable folder: ${game.exe ? game.exe.slice(0, game.exe.lastIndexOf("/")) : game.installDir}`,
			"Would download ReShade 6.8.0 add-on setup from reshade.me",
			`Would download ${PACK.shortfuse}`,
			`Would download ${PACK.neural}`,
			game.hasDlss && !overwrite ? "Game already ships DLSS. Those DLLs would be left alone." : `Would download ${PACK.streamline}`,
			"Would write ReShade.ini with LoadFromDllMain=renodx-dlss.addon64",
			`Steam launch option: ${launchOptions(hook)}`,
			"Sample library only — nothing was written. Open the Linux app to install into a real game folder."
		];
		setLog(lines);
		setGames((current) => current.map((item) => item.appid === game.appid ? {
			...item,
			installedByForge: true,
			hook
		} : item));
	}
	async function install(game) {
		if (mode === "demo") {
			simulateInstall(game);
			return;
		}
		setBusy(true);
		setLog(["Starting install…"]);
		const body = {
			appid: game.appid,
			hook,
			overwriteDlss: overwrite,
			confirmAnticheat: ack
		};
		if (game.api === "unknown") body.apiOverride = hook === "d3d11" ? "dx11" : "dx12";
		try {
			const res = await fetch(`${AGENT_ORIGIN}/api/install`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body)
			});
			if (!res.ok) {
				const err = await res.json();
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
			const job = await (await fetch(`${AGENT_ORIGIN}/api/job`)).json();
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
	async function remove(game) {
		if (mode === "demo") {
			setGames((current) => current.map((item) => item.appid === game.appid ? {
				...item,
				installedByForge: false,
				hook: null
			} : item));
			setLog(["Sample only. The install marker was cleared in this preview."]);
			return;
		}
		const res = await fetch(`${AGENT_ORIGIN}/api/remove`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ appid: game.appid })
		});
		const data = await res.json();
		if (!res.ok) {
			setLog([data.error ?? "Could not remove."]);
			return;
		}
		setLog([`Removed ${data.removed?.join(", ") || "Forge files"}. Backups were kept.`]);
		await connect({ preserveLog: true });
	}
	async function copyLaunch(value) {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
		} catch {
			setCopied(false);
		}
	}
	const canInstall = Boolean(selected && selected.exe && selected.bits !== 32 && (selected.api === "dx11" || selected.api === "dx12" || selected.api === "unknown") && !busy);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pt-8 pb-2 sm:px-6 lg:flex-row lg:items-end lg:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs tracking-widest text-subtle",
						children: "LINUX · STEAM · PROTON"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 text-4xl font-semibold tracking-tight sm:text-5xl",
						children: "Forge"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-xl text-base text-muted",
						children: "Pick a Steam game. Forge packs ReShade 6.8.0, the ShortFuse DLSS add-on, and the NVIDIA files into the Windows build so Proton can run DLSS 5."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setShowLauncher((open) => !open),
						className: "inline-flex h-11 items-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold text-accent-fg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
							className: "size-4",
							"aria-hidden": "true"
						}), "Get the Linux app"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => void (mode === "live" ? refreshLive() : connect()),
						className: "inline-flex h-11 items-center gap-2 rounded-full border border-line px-4 text-sm text-fg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
							className: `size-4 ${connecting ? "animate-spin" : ""}`,
							"aria-hidden": "true"
						}), mode === "live" ? "Rescan Steam" : "Connect local app"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto w-full max-w-6xl px-4 sm:px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `mt-4 rounded-lg border px-4 py-3 text-sm ${mode === "live" ? "border-line text-ok" : "border-line text-muted"}`,
						children: mode === "live" ? "Connected. This list is the Steam library on this computer." : "Sample library, so you can see the install before anything is on disk. Download the Linux app to scan your real Steam folders."
					}),
					connectError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-bad",
						children: connectError
					}) : null,
					warnings.map((warning) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-warn",
						children: warning
					}, warning)),
					showLauncher ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-4 rounded-xl border border-line bg-surface p-4 sm:p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold",
								children: "Run Forge on Linux"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
								className: "mt-3 list-decimal space-y-2 pl-5 text-sm text-muted",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Download the single file. It is the app, not an installer that needs root." }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "In the file manager, open Properties and allow executing the file, then open it. A browser window lists the games Steam has installed." }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Works on Arch, CachyOS, Fedora, Debian, and other glibc systems that already have python3. Flatpak Steam and Snap Steam are included." })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: "/ForgeDLSS5.run",
								download: "ForgeDLSS5.run",
								className: "mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold text-accent-fg",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
									className: "size-4",
									"aria-hidden": "true"
								}), "Download ForgeDLSS5.run"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-subtle",
								children: "The file is a real launcher, not a disk image. An AppImage would need FUSE, which CachyOS and some Arch installs do not ship. This one does not."
							})
						]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto grid w-full max-w-6xl gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:py-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: `${showDetail ? "hidden lg:block" : ""} rounded-xl border border-line bg-surface p-3`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex h-11 items-center gap-2 rounded-full border border-line bg-surface-2 px-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
								className: "size-4 text-subtle",
								"aria-hidden": "true"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: query,
								onChange: (event) => setQuery(event.target.value),
								placeholder: "Filter games",
								className: "w-full bg-transparent text-sm outline-none placeholder:text-subtle",
								"aria-label": "Filter games"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							role: "toolbar",
							"aria-label": "Library filters",
							children: FILTERS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": filter === item.id,
								onClick: () => setFilter(item.id),
								className: `h-9 rounded-full px-3 text-sm ${filter === item.id ? "bg-accent text-accent-fg" : "border border-line text-muted"}`,
								children: item.label
							}, item.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 max-h-screen overflow-auto",
							role: "listbox",
							"aria-label": "Games",
							children: visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "px-2 py-6 text-sm text-muted",
								children: "Nothing in this filter."
							}) : visible.map((game) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								role: "option",
								"aria-selected": selected?.appid === game.appid,
								onClick: () => selectGame(game),
								className: `flex w-full flex-col gap-1 rounded-md px-3 py-3 text-left ${selected?.appid === game.appid ? "bg-surface-2" : "hover:bg-surface-2"}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold",
										children: game.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pills, { game }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate font-mono text-xs text-subtle",
										children: game.exeRelative ?? game.installDir
									})
								]
							}, game.appid))
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: `${showDetail ? "" : "hidden lg:block"} rounded-xl border border-line bg-surface p-4 sm:p-5`,
					children: selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Detail, {
						game: selected,
						hook,
						overwrite,
						ack,
						busy,
						copied,
						log,
						canInstall,
						mode,
						onBack: () => setShowDetail(false),
						onHook: setHook,
						onOverwrite: setOverwrite,
						onAck: setAck,
						onInstall: () => void install(selected),
						onRemove: () => void remove(selected),
						onCopy: () => void copyLaunch(launchOptions(hook))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "No game selected."
					})
				})]
			})
		]
	});
}
function Pills({ game }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "flex flex-wrap gap-1.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "rounded-full border border-line px-2 py-0.5 text-xs text-muted",
				children: apiLabel(game.api)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "rounded-full border border-line px-2 py-0.5 text-xs text-muted",
				children: game.bits ? `${game.bits}-bit` : "bitness unknown"
			}),
			game.hasDlss ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "rounded-full border border-line px-2 py-0.5 text-xs text-ok",
				children: "ships DLSS"
			}) : null,
			game.installedByForge ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "rounded-full border border-line px-2 py-0.5 text-xs text-ok",
				children: "Forge installed"
			}) : null,
			game.anticheat ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "rounded-full border border-line px-2 py-0.5 text-xs text-bad",
				children: "anti-cheat"
			}) : null,
			game.steamKind !== "native" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "rounded-full border border-line px-2 py-0.5 text-xs text-muted",
				children: game.steamKind
			}) : null
		]
	});
}
function Detail({ game, hook, overwrite, ack, busy, copied, log, canInstall, mode, onBack, onHook, onOverwrite, onAck, onInstall, onRemove, onCopy }) {
	const blocked = Boolean(game.anticheat) && !ack;
	const launch = launchOptions(hook);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: onBack,
			className: "mb-3 inline-flex h-10 items-center gap-1 text-sm text-muted lg:hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
				className: "size-4",
				"aria-hidden": "true"
			}), "All games"]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-2xl font-semibold tracking-tight",
			children: game.name
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pills, { game })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 font-mono text-xs break-all text-muted",
			children: game.installDir
		}),
		game.exeRelative ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-xs break-all text-subtle",
			children: game.exeRelative
		}) : null,
		game.unsupportedReason && game.api !== "dx11" && game.api !== "dx12" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-warn",
			children: game.unsupportedReason
		}) : null,
		game.api === "unknown" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-3 text-sm text-warn",
			children: [game.unsupportedReason, " Choosing d3d11.dll treats it as DX11. dxgi.dll or d3d12.dll treats it as DX12."]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs tracking-wider text-subtle uppercase",
				children: "Hook"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 flex flex-wrap gap-2",
				role: "radiogroup",
				"aria-label": "ReShade hook DLL",
				children: HOOKS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					role: "radio",
					"aria-checked": hook === item,
					onClick: () => onHook(item),
					className: `h-9 rounded-full px-3 text-sm ${hook === item ? "bg-accent text-accent-fg" : "border border-line text-muted"}`,
					children: [item, ".dll"]
				}, item))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-wider text-subtle uppercase",
					children: "What gets packed"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 list-disc space-y-1 pl-5 text-sm text-muted",
					children: packLines(game, hook, overwrite).map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: line }, line))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-subtle",
					children: "There is no public ShortFuse build named v7. Forge uses the current add-on, SF 26.0928.0205, and the patched neural DLL 310.8.SF-v2. To force a file you already have, put renodx-dlss.addon64 or nvngx_dlssnr.dll in ~/.local/share/forge-dlss5/payload before installing."
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "mt-4 flex items-start gap-2 text-sm text-muted",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "checkbox",
				className: "mt-1 size-4",
				checked: overwrite,
				onChange: (event) => onOverwrite(event.target.checked)
			}), "Overwrite the game's DLSS and Streamline DLLs. Previous files are copied into .forge-dlss5-backup first."]
		}),
		game.anticheat ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "mt-3 flex items-start gap-2 text-sm text-bad",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, {
				className: "mt-0.5 size-4 shrink-0",
				"aria-hidden": "true"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					className: "mr-2 size-4 align-middle",
					checked: ack,
					onChange: (event) => onAck(event.target.checked)
				}),
				"This folder looks like ",
				game.anticheat,
				". I accept that the game may refuse to start or ban the account."
			] })]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 flex flex-wrap gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: !canInstall || blocked,
				onClick: onInstall,
				className: "h-11 rounded-full bg-accent px-4 text-sm font-semibold text-accent-fg disabled:opacity-40",
				children: busy ? "Installing…" : game.installedByForge ? "Reinstall DLSS 5" : "Install DLSS 5"
			}), game.installedByForge ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onRemove,
				className: "h-11 rounded-full border border-line px-4 text-sm",
				children: "Remove Forge files"
			}) : null]
		}),
		mode === "demo" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-xs text-subtle",
			children: "Install here walks the real file plan against the sample. It does not download or write anything."
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs tracking-wider text-subtle uppercase",
				children: "Steam launch option"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex items-start gap-2 rounded-md bg-bg p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
					className: "min-w-0 flex-1 font-mono text-xs break-all text-fg",
					children: launch
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onCopy,
					className: "inline-flex h-9 shrink-0 items-center gap-1 rounded-full border border-line px-3 text-xs",
					children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
						className: "size-3.5",
						"aria-hidden": "true"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {
						className: "size-3.5",
						"aria-hidden": "true"
					}), copied ? "Copied" : "Copy"]
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs tracking-wider text-subtle uppercase",
				children: "Compatibility"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 list-disc space-y-2 pl-5 text-sm text-muted",
				children: compatibilityNotes(game, hook).map((note) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: note }, note))
			})]
		}),
		log ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs tracking-wider text-subtle uppercase",
				children: "Log"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
				className: "mt-2 max-h-56 overflow-auto rounded-md bg-bg p-3 font-mono text-xs whitespace-pre-wrap text-muted",
				children: log.join("\n")
			})]
		}) : null
	] });
}
var SplitComponent = ForgeApp;
//#endregion
export { SplitComponent as component };
