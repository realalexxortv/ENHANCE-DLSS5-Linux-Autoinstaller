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
};

export const PACK = {
  reshade: "ReShade 6.8.0 with full add-on support",
  shortfuse: "ShortFuse renodx-dlss.addon64 · SF 26.0928.0205",
  neural: "NVIDIA nvngx_dlssnr.dll · 310.8.SF-v2",
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

export function launchOptions(hook: Hook): string {
  return `WINEDLLOVERRIDES="${hook}=n,b" PROTON_ENABLE_NVAPI=1 %command%`;
}

export function packLines(game: Game, hook: Hook, overwrite: boolean): string[] {
  const lines = [
    `${hook}.dll — ReShade 6.8.0 add-on build, renamed from ReShade64.dll`,
    "renodx-dlss.addon64 — ShortFuse DLSS add-on, SF 26.0928.0205",
    "nvngx_dlssnr.dll — NVIDIA neural runtime 310.8.SF-v2 (RTX 20 through 50)",
    "ReShade.ini — LoadFromDllMain=renodx-dlss.addon64, Unix line endings",
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
      ? "DX11: dxgi.dll is the usual Proton hook. If the game closes before the menu, switch to d3d11.dll and copy the launch option again."
      : "DX12: dxgi.dll is the usual Proton hook. A black image with the ReShade overlay still up means switch to d3d12.dll. Use Proton Experimental, GE-Proton, or CachyOS proton-cachyos so vkd3d-proton understands the ReShade 6.8 add-on.";
  const store =
    game.steamKind === "flatpak"
      ? "This copy is the Flatpak version of Steam. Forge still writes into that library. The launch option is the same."
      : game.steamKind === "snap"
        ? "This copy is the Snap version of Steam. Forge still writes into that library. The launch option is the same."
        : "Native, Flatpak, and Snap Steam are all scanned. The launch option does not change between them.";
  return [
    "Steam → the game → Properties → Compatibility. Check “Force the use of a specific Steam Play compatibility tool”. Choose Proton Experimental, GE-Proton, or on CachyOS proton-cachyos / proton-ge-custom. Skip Proton 8 and older.",
    "Paste the launch option into Properties → General → Launch Options, including %command%.",
    "NVIDIA's proprietary driver and an RTX 20, 30, 40, or 50. Nouveau will not run DLSS. 310.8.SF-v2 is the patched ShortFuse neural DLL for that whole range.",
    "The pack targets the Windows executable. If Steam would start a native Linux build, the compatibility checkbox is what forces Proton.",
    hookNote,
    "In the game, press Home. Open Add-ons and turn on RenoDX DLSS / Neural Rendering. Games that did not ship DLSS need Hook Method set to On Present and Require DLSS set to Off.",
    "Single-player only. Easy Anti-Cheat, BattlEye, Vanguard, and VAC can refuse to start or ban the account. Forge will not install those quietly.",
    store,
    "No root. The Linux file needs python3, which Arch, CachyOS, Fedora, and Debian already have. The first install downloads ReShade, the ShortFuse add-on, and the NVIDIA files, and unpacks ReShade with 7-Zip (downloaded if it is not installed).",
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
