export type ApiKind = "dx11" | "dx12" | "dx9" | "vulkan" | "opengl" | "unknown";
export type Hook = "dxgi" | "d3d11" | "d3d12";
export type SteamKind = "native" | "flatpak" | "snap";
export type Filter = "ready" | "all" | "installed" | "skipped";

export type Game = {
  appid: string;
  name: string;
  library: string;
  installDir: string;
  exe: string | null;
  exeRelative: string | null;
  api: ApiKind;
  bits: 64 | 32 | null;
  hasDlss: boolean;
  dlssPath: string | null;
  anticheat: string | null;
  installedByForge: boolean;
  hook: Hook | null;
  steamKind: SteamKind;
  unsupportedReason: string | null;
  cover?: string | null;
  skipReason?: string | null;
};

export const PACK = {
  reshade: "ReShade 6.8.0 with full add-on support",
  addon: "Lecram DLSS 5 add-on renodx-dlss5.addon64 · v7.0.0-rc8",
  neural: "Lecram nvngx_dlssnr.dll · 310.8.Lecram",
  streamline: "NVIDIA Streamline runtime (nvngx_dlss.dll, nvngx_dlssg.dll, sl.interposer.dll and the sl.*.dll set)",
};

export const AGENT_ORIGIN = "http://127.0.0.1:4775";

const sample = (partial: Game): Game => partial;

export const DEMO_GAMES: Game[] = [
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
    unsupportedReason: null,
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
    unsupportedReason: null,
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
    unsupportedReason: null,
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
    unsupportedReason: null,
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
    unsupportedReason: null,
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
    unsupportedReason: null,
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
    unsupportedReason: null,
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
    unsupportedReason: null,
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
    unsupportedReason: "Detected vulkan. Vulkan and OpenGL are not hooked by this pack.",
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
    unsupportedReason: "Detected vulkan. Vulkan and OpenGL are not hooked by this pack.",
  }),
];

export function isReady(game: Game): boolean {
  return (game.api === "dx11" || game.api === "dx12") && game.bits !== 32 && Boolean(game.exe);
}

export function isSkipped(game: Game): boolean {
  return !isReady(game) || Boolean(game.anticheat);
}

function anticheatLabel(value: string): string {
  if (value === "easyanticheat") return "Easy Anti-Cheat";
  if (value === "battleye") return "BattlEye";
  if (value === "vac") return "VAC";
  return value;
}

export function skipReason(game: Game): string | null {
  if (!isSkipped(game)) return null;
  if (game.skipReason) return game.skipReason;
  const parts: string[] = [];
  if (game.bits === 32) parts.push("32-bit executable. Only 64-bit games are packed.");
  else if (game.api === "dx9") parts.push("DirectX 9. Only DX11 and DX12 are hooked.");
  else if (game.api === "vulkan") parts.push("Vulkan. Only DX11 and DX12 are hooked.");
  else if (game.api === "opengl") parts.push("OpenGL. Only DX11 and DX12 are hooked.");
  else if (!game.exe) parts.push("No Windows executable in the install folder.");
  else if (game.api === "unknown") {
    parts.push("The executable does not import d3d11 or d3d12. You can still force a DX11 or DX12 hook.");
  }
  if (game.anticheat) {
    parts.push(
      `${anticheatLabel(game.anticheat)} is in this folder. The hook can make the game refuse to start or ban the account.`,
    );
  }
  if (parts.length === 0) return game.unsupportedReason;
  if (game.api === "unknown" && !game.anticheat) return parts[0] ?? null;
  return `Skipped: ${parts.join(" ")}`;
}

export function coverUrl(game: Game, live: boolean): string {
  if (game.cover) {
    if (live && game.cover.startsWith("/")) return `${AGENT_ORIGIN}${game.cover}`;
    return game.cover;
  }
  return live ? `${AGENT_ORIGIN}/cover/${game.appid}` : `/covers/${game.appid}.jpg`;
}

export const HOOK_HELP: { hook: Hook; title: string; body: string }[] = [
  {
    hook: "dxgi",
    title: "dxgi.dll",
    body: "Default for both DX11 and DX12. Proton loads it when the game creates a swap chain. Start here.",
  },
  {
    hook: "d3d11",
    title: "d3d11.dll",
    body: "DX11 only. Use this if the game closes before the menu while dxgi.dll is the hook.",
  },
  {
    hook: "d3d12",
    title: "d3d12.dll",
    body: "DX12 only. Use this if the picture stays black but the ReShade overlay still opens with Home.",
  },
];

export function launchOptions(hook: Hook): string {
  return `WINEDLLOVERRIDES="${hook}=n,b" PROTON_ENABLE_NVAPI=1 %command%`;
}

export function packLines(game: Game, hook: Hook, overwrite: boolean): string[] {
  const lines = [
    `${hook}.dll — ReShade 6.8.0 add-on build, renamed from ReShade64.dll`,
    "renodx-dlss5.addon64 — Lecram DLSS 5 add-on, v7.0.0-rc8",
    "nvngx_dlssnr.dll — Lecram neural runtime 310.8.Lecram (RTX 50 build)",
    "ReShade.ini — LoadFromDllMain=renodx-dlss5.addon64, Unix line endings",
  ];
  if (!game.hasDlss || overwrite) {
    lines.push(
      "nvngx_dlss.dll, nvngx_dlssg.dll, sl.interposer.dll, and the rest of the Streamline set",
    );
  } else {
    lines.push("The game's own DLSS and Streamline files stay where they are");
  }
  if (game.hasDlss && game.dlssPath && !game.dlssPath.endsWith(`${hook}.dll`)) {
    lines.push("nvngx_dlssnr.dll is also copied beside the game's existing nvngx_dlss.dll");
  }
  return lines;
}

export function compatibilityNotes(game: Game, hook: Hook): string[] {
  const hookNote =
    game.api === "dx11" || hook === "d3d11"
      ? "This game looks like DX11. dxgi.dll is the right first hook. d3d12.dll will not attach."
      : "This game looks like DX12. dxgi.dll is the right first hook. d3d11.dll will not attach. Use Proton Experimental, GE-Proton, or CachyOS proton-cachyos so vkd3d-proton is new enough for ReShade 6.8.";
  const store =
    game.steamKind === "flatpak"
      ? "This copy is the Flatpak version of Steam. ENHANCE still writes into that library. The launch option is the same."
      : game.steamKind === "snap"
        ? "This copy is the Snap version of Steam. ENHANCE still writes into that library. The launch option is the same."
        : "Native, Flatpak, and Snap Steam are all scanned. The launch option does not change between them.";
  return [
    "Steam → the game → Properties → Compatibility. Check “Force the use of a specific Steam Play compatibility tool”. Choose Proton Experimental, GE-Proton, or on CachyOS proton-cachyos / proton-ge-custom. Skip Proton 8 and older.",
    "Paste the launch option into Properties → General → Launch Options, including %command%.",
    "NVIDIA's proprietary driver. 310.8.Lecram is the RTX 50 neural DLL. On an RTX 20, 30, or 40, put the matching nvngx_dlssnr.dll from the DLSS 5 Discord in ~/.local/share/enhance-dlss5/payload before installing. Nouveau will not run DLSS.",
    "The pack targets the Windows executable. If Steam would start a native Linux build, the compatibility checkbox is what forces Proton.",
    hookNote,
    "In the game, press Home. Open Add-ons and turn on RenoDX DLSS / Neural Rendering. Games that did not ship DLSS need Hook Method set to On Present and Require DLSS set to Off.",
    "Single-player only. Easy Anti-Cheat, BattlEye, Vanguard, and VAC can refuse to start or ban the account. ENHANCE will not install those quietly.",
    store,
    "No root. The AppImage needs python3, which Arch, CachyOS, Fedora, and Debian already have. The first install downloads ReShade, Lecram's DLSS 5 add-on, and the NVIDIA files. If 7-Zip is not already on the system, the AppImage uses the copy bundled inside it.",
  ];
}

export function apiLabel(api: ApiKind): string {
  if (api === "dx11") return "DX11";
  if (api === "dx12") return "DX12";
  if (api === "dx9") return "DX9";
  if (api === "vulkan") return "Vulkan";
  if (api === "opengl") return "OpenGL";
  return "API unknown";
}
