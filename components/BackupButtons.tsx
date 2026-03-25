"use client";

export default function BackupButtons() {

  function exportAllData() {
    const data: any = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      data[key] = localStorage.getItem(key);
    }

    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quantum-backup.json";
    a.click();
  }

  function importAllData(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e: any) {
      const data = JSON.parse(e.target.result);

      Object.keys(data).forEach(key => {
        localStorage.setItem(key, data[key]);
      });

      alert("Backup restored!");
      location.reload();
    };

    reader.readAsText(file);
  }

return (
  <div className="mt-6 space-y-3">
    <div className="text-xs font-orbitron tracking-widest text-muted-foreground/60 uppercase">
      Backup & Restore
    </div>

    {/* Export Button */}
    <button
      onClick={exportAllData}
      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-background/40 backdrop-blur-sm text-sm font-rajdhani tracking-wide text-foreground/80 hover:text-primary hover:border-primary/40 hover:bg-background/60 transition-all"
    >
      Export Backup
    </button>

    {/* Import Button (styled input) */}
    <label className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-background/40 backdrop-blur-sm text-sm font-rajdhani tracking-wide text-foreground/80 cursor-pointer hover:text-primary hover:border-primary/40 hover:bg-background/60 transition-all">
      Import Backup
      <input
        type="file"
        onChange={importAllData}
        className="hidden"
      />
    </label>
  </div>
);
}
