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
    <div style={{ marginTop: "20px" }}>
      <button onClick={exportAllData}>
        Export Backup
      </button>

      <br /><br />

      <input type="file" onChange={importAllData} />
    </div>
  );
}
