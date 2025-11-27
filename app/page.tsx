"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";
import {
  Heart,
  Link2,
  Sparkles,
  Copy,
  Check,
  QrCode,
  MessageCircle,
  Share2,
  Users,
  UserRound,
} from "lucide-react";
import { BASE_UNDANGAN_URL } from "../config/site";

type InviteEntry = {
  name: string;
  url: string;
};

// Preset pesan undangan
const MESSAGE_PRESETS = [
  {
    id: "none",
    label: "Tanpa pesan",
    badge: "Hanya kirim link",
    text: "",
  },
  {
    id: "indo_formal",
    label: "Bahasa Indonesia",
    badge: "Formal & terhormat",
    text:
      "Yth. {NAMA},\n\nDengan penuh hormat kami mengundang Bapak/Ibu untuk hadir dalam acara pernikahan kami. " +
      "Kehadiran {NAMA} akan menjadi kehormatan dan kebahagiaan bagi kami sekeluarga.\n\n" +
      "Informasi lengkap mengenai waktu dan lokasi acara dapat dilihat pada tautan undangan berikut:\n{LINK}\n\n" +
      "Atas perhatian dan doa restunya, kami ucapkan terima kasih.",
  },
  {
    id: "bali_alus",
    label: "Bahasa Bali Alus",
    badge: "Halus & sangat sopan",
    text:
      "Om Swastyastu {NAMA},\n\nRaris sareng titiang nyuunangang hadirin ring {NAMA} ring acara pawiwahan sane prasida kalaksanayang. " +
      "Kehadiran {NAMA} dados pakulawargan rahajeng miwah nambahin kabagyan ring titiang sekeluarga.\n\n" +
      "Warsa, kala, miwah papan acara prasida katitiang ring pranatan undangan online puniki:\n{LINK}\n\n" +
      "Matur suksma sanget ring pangrungu miwah pangrestu sane kaicen.\n\nOm Shanti Shanti Shanti Om.",
  },
  {
    id: "bali_madya",
    label: "Bahasa Bali Madya",
    badge: "Lebih santai namun sopan",
    text:
      "Om Swastyastu {NAMA},\n\nTiang ngajak {NAMA} sareng keluarga rauh ring acara pawiwahan tiang. " +
      "Kehadiran {NAMA} nyenengin miwah nambah rahajeng ring acara puniki.\n\n" +
      "Waktu lan tempat acara sampun kaatur ring undangan online puniki:\n{LINK}\n\n" +
      "Matur suksma sanget atas perhatian lan pangrestu {NAMA}.\n\nOm Shanti Shanti Shanti Om.",
  },
];

export default function HomePage() {
  const [mode, setMode] = useState<"single" | "bulk">("single");

  // single mode
  const [nama, setNama] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [copiedSingle, setCopiedSingle] = useState(false);

  // bulk mode
  const [bulkInput, setBulkInput] = useState("");
  const [bulkInvites, setBulkInvites] = useState<InviteEntry[]>([]);
  const [copiedBulkIndex, setCopiedBulkIndex] = useState<number | null>(null);

  // message preset + custom
  const [selectedPreset, setSelectedPreset] = useState<string>("none");
  const [customMessage, setCustomMessage] = useState<string>("");

  const handlePresetChange = (id: string) => {
    setSelectedPreset(id);
    const preset = MESSAGE_PRESETS.find((p) => p.id === id);
    setCustomMessage(preset?.text ?? "");
  };

  // SINGLE
  const handleGenerateSingle = (e: FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !BASE_UNDANGAN_URL) return;

    const encoded = encodeURIComponent(nama.trim());
    setGeneratedUrl(`${BASE_UNDANGAN_URL}?nama=${encoded}`);
    setCopiedSingle(false);
  };

  // BULK
  const handleGenerateBulk = (e: FormEvent) => {
    e.preventDefault();
    if (!bulkInput.trim() || !BASE_UNDANGAN_URL) return;

    const lines = bulkInput
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const invites: InviteEntry[] = lines.map((name) => ({
      name,
      url: `${BASE_UNDANGAN_URL}?nama=${encodeURIComponent(name)}`,
    }));

    setBulkInvites(invites);
    setCopiedBulkIndex(null);
  };

  // Helper: bangun teks pesan final
  const buildMessage = (name: string, url: string) => {
    const label = name.trim() || "Bapak/Ibu";

    // Kalau tidak ada preset & textarea kosong → hanya link
    if (selectedPreset === "none" && !customMessage.trim()) {
      return `Undangan untuk ${label}:\n${url}`;
    }

    const base =
      customMessage.trim() ||
      `Undangan untuk ${label}:\n${url}`; // fallback jaga-jaga

    return base
      .replaceAll("{NAMA}", label)
      .replaceAll("{LINK}", url);
  };

  // COPY / SHARE
  const handleCopySingle = async () => {
    if (!generatedUrl) return;
    const text = buildMessage(nama.trim() || "Tamu Undangan", generatedUrl);
    await navigator.clipboard.writeText(text);
    setCopiedSingle(true);
    setTimeout(() => setCopiedSingle(false), 1500);
  };

  const handleCopyBulk = async (index: number) => {
    const entry = bulkInvites[index];
    if (!entry) return;
    const text = buildMessage(entry.name, entry.url);
    await navigator.clipboard.writeText(text);
    setCopiedBulkIndex(index);
    setTimeout(() => setCopiedBulkIndex(null), 1500);
  };

  const shareMessage = async (
    platform: "wa" | "native",
    name: string,
    url: string
  ) => {
    if (!url) return;

    const text = buildMessage(name, url);

    if (platform === "wa") {
      const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(waUrl, "_blank");
      return;
    }

    if (platform === "native") {
      if (navigator.share) {
        try {
          await navigator.share({
            title: "Undangan Pernikahan",
            text,
            url,
          });
        } catch {
          // user cancel → abaikan
        }
      } else {
        await navigator.clipboard.writeText(text);
      }
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#22d3ee33,transparent_60%),radial-gradient(circle_at_bottom,#a855f733,transparent_60%)]" />
      <div className="pointer-events-none absolute -left-28 top-10 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 bottom-0 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-5xl"
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900/60 px-4 py-1 text-xs text-cyan-200 ring-1 ring-slate-700 backdrop-blur"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Wedding URL, QR & Message Generator • EO Friendly
            </motion.div>

            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Kelola undangan digital{" "}
              <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-fuchsia-300 bg-clip-text text-transparent">
                personal & massal
              </span>
            </h1>

            <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
              Mode <span className="font-medium text-cyan-300">Single</span> untuk
              satu tamu/pasangan, dan mode{" "}
              <span className="font-medium text-fuchsia-300">Bulk</span> untuk
              banyak nama sekaligus. Setiap tamu dapat link unik, QR code, dan
              pesan undangan terhormat dalam Bahasa Indonesia atau Bahasa Bali.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)]">
            {/* Kiri: mode + form + template pesan */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl"
            >
              {/* Mode switch */}
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-400 text-slate-950 shadow-lg shadow-cyan-500/40">
                    <Heart className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Pengaturan Undangan
                    </p>
                    <p className="text-xs text-slate-400">
                      Pilih mode & bahasa pesan undangan.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4 inline-flex rounded-full border border-slate-700 bg-slate-900/80 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setMode("single")}
                  className={`flex items-center gap-1 rounded-full px-3 py-1.5 transition ${
                    mode === "single"
                      ? "bg-slate-800 text-cyan-300"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <UserRound className="h-3.5 w-3.5" />
                  Single
                </button>
                <button
                  type="button"
                  onClick={() => setMode("bulk")}
                  className={`flex items-center gap-1 rounded-full px-3 py-1.5 transition ${
                    mode === "bulk"
                      ? "bg-slate-800 text-fuchsia-300"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  Bulk
                </button>
              </div>

              {/* Template pesan sebagai chip buttons */}
              <div className="mb-5 space-y-2">
                <label className="text-xs uppercase tracking-wide text-slate-300">
                  Template Pesan Undangan (opsional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {MESSAGE_PRESETS.map((preset) => {
                    const active = selectedPreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handlePresetChange(preset.id)}
                        className={`group flex flex-col items-start rounded-2xl border px-3 py-2 text-left text-xs transition ${
                          active
                            ? "border-cyan-400/80 bg-slate-800 text-slate-50 shadow-md shadow-cyan-500/20"
                            : "border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-500 hover:bg-slate-800/80"
                        }`}
                      >
                        <span
                          className={`font-medium ${
                            active ? "text-cyan-300" : "text-slate-100"
                          }`}
                        >
                          {preset.label}
                        </span>
                        {preset.badge && (
                          <span className="mt-0.5 text-[10px] text-slate-400">
                            {preset.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Placeholder{" "}
                  <span className="font-mono text-[11px] text-cyan-300">
                    {"{NAMA}"}
                  </span>{" "}
                  akan diganti dengan nama tamu, dan{" "}
                  <span className="font-mono text-[11px] text-cyan-300">
                    {"{LINK}"}
                  </span>{" "}
                  dengan link undangan. Jika memilih{" "}
                  <span className="font-semibold">Tanpa pesan</span> dan kolom
                  di bawah dibiarkan kosong, maka yang dikirim hanya link.
                </p>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-lg bg-slate-900/70 border border-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 outline-none"
                  placeholder="Teks undangan akan muncul di sini jika memilih preset. Bisa diedit bebas..."
                />
              </div>

              {/* Form sesuai mode */}
              {mode === "single" ? (
                <>
                  <p className="mb-4 text-xs text-slate-400 leading-relaxed">
                    Mode{" "}
                    <span className="text-cyan-300 font-medium">Single</span>:
                    gunakan untuk mengirim undangan per tamu atau per pasangan.
                    Misalnya: <i>“Bapak Made &amp; Ibu Ayu”</i> atau{" "}
                    <i>“Ibu Ayu Sukerti”</i>.
                  </p>

                  <form onSubmit={handleGenerateSingle} className="space-y-4">
                    <div>
                      <label
                        htmlFor="nama"
                        className="text-xs uppercase tracking-wide text-slate-300"
                      >
                        Nama Tamu / Pasangan
                      </label>
                      <div className="relative mt-1">
                        <input
                          id="nama"
                          type="text"
                          value={nama}
                          onChange={(e) => setNama(e.target.value)}
                          placeholder="contoh: Bapak Made & Ibu Ayu"
                          className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/40 outline-none"
                        />
                        <Link2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      </div>
                      <p className="text-xs mt-1 text-slate-400">
                        Simbol "&amp;" akan otomatis diubah menjadi format aman di
                        URL (misal: <code>%26</code>).
                      </p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-400 px-4 py-3 font-semibold text-slate-900 shadow-lg"
                      type="submit"
                    >
                      <Sparkles className="h-4 w-4" />
                      Generate Link &amp; QR
                    </motion.button>
                  </form>
                </>
              ) : (
                <>
                  <p className="mb-4 text-xs text-slate-400 leading-relaxed">
                    Mode{" "}
                    <span className="text-fuchsia-300 font-medium">Bulk</span>:
                    tempel daftar nama tamu / pasangan,{" "}
                    <span className="font-semibold text-slate-200">
                      satu nama per baris
                    </span>
                    . Setiap baris akan dibuatkan link &amp; QR sendiri.
                  </p>

                  <form onSubmit={handleGenerateBulk} className="space-y-4">
                    <div>
                      <label
                        htmlFor="bulk"
                        className="text-xs uppercase tracking-wide text-slate-300"
                      >
                        Daftar Nama (satu per baris)
                      </label>
                      <textarea
                        id="bulk"
                        value={bulkInput}
                        onChange={(e) => setBulkInput(e.target.value)}
                        rows={8}
                        className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-500/40 outline-none"
                        placeholder={`Contoh:\nBapak Made & Ibu Ayu\nKeluarga Ibu Ayu Sukerti\nPutu Andre Pratama`}
                      />
                      <p className="text-xs mt-1 text-slate-400">
                        Cocok untuk copy–paste dari Excel / Google Sheets (kolom
                        nama).
                      </p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-400 via-sky-400 to-cyan-400 px-4 py-3 font-semibold text-slate-900 shadow-lg"
                      type="submit"
                    >
                      <Sparkles className="h-4 w-4" />
                      Generate Semua Link &amp; QR
                    </motion.button>
                  </form>
                </>
              )}
            </motion.div>

            {/* Kanan: hasil */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl"
            >
              {mode === "single" ? (
                generatedUrl ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-200">
                      <QrCode className="h-4 w-4 text-cyan-300" />
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Link &amp; QR untuk {nama.trim() || "Tamu Undangan"}
                      </p>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      {/* QR */}
                      <div className="flex justify-center">
                        <div className="rounded-xl bg-white p-3 shadow-md">
                          <QRCode
                            value={generatedUrl}
                            size={120}
                            style={{
                              height: "auto",
                              maxWidth: "100%",
                              width: "120px",
                            }}
                          />
                        </div>
                      </div>

                      {/* link + tombol */}
                      <div className="flex-1 space-y-2">
                        <div className="rounded bg-slate-950/60 p-3 text-xs text-slate-200 break-all">
                          {generatedUrl}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={handleCopySingle}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-100 hover:bg-slate-700"
                            type="button"
                          >
                            {copiedSingle ? (
                              <>
                                <Check className="h-4 w-4 text-emerald-400" />
                                Tersalin (pesan + link)
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4" />
                                Salin Pesan + Link
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              shareMessage(
                                "wa",
                                nama.trim() || "Tamu Undangan",
                                generatedUrl
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/90 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-500"
                          >
                            <MessageCircle className="h-4 w-4" />
                            WhatsApp
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              shareMessage(
                                "native",
                                nama.trim() || "Tamu Undangan",
                                generatedUrl
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-3 py-2 text-xs font-medium text-slate-50 hover:bg-slate-600"
                          >
                            <Share2 className="h-4 w-4" />
                            Share Sistem
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    Belum ada hasil. Isi nama di sebelah kiri, lalu klik{" "}
                    <span className="font-semibold">Generate Link &amp; QR</span>.
                  </p>
                )
              ) : bulkInvites.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-slate-200">
                      <QrCode className="h-4 w-4 text-fuchsia-300" />
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Daftar Link &amp; QR (Bulk)
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Total tamu:{" "}
                      <span className="font-semibold text-slate-200">
                        {bulkInvites.length}
                      </span>
                    </p>
                  </div>

                  <div className="max-h-[480px] space-y-2 overflow-y-auto pr-1">
                    {bulkInvites.map((entry, index) => (
                      <div
                        key={`${entry.name}-${index}`}
                        className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-200"
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <p className="font-semibold text-slate-100">
                            {entry.name}
                          </p>
                          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                            #{index + 1}
                          </span>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          {/* QR kecil */}
                          <div className="flex justify-start sm:justify-center">
                            <div className="rounded-lg bg-white p-2 shadow">
                              <QRCode
                                value={entry.url}
                                size={72}
                                style={{
                                  height: "auto",
                                  maxWidth: "100%",
                                  width: "72px",
                                }}
                              />
                            </div>
                          </div>

                          <div className="flex-1 space-y-2">
                            <div className="rounded bg-slate-900/80 p-2 text-[11px] break-all">
                              {entry.url}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => handleCopyBulk(index)}
                                className="inline-flex items-center justify-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1.5 text-[11px] text-slate-100 hover:bg-slate-700"
                              >
                                {copiedBulkIndex === index ? (
                                  <>
                                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                                    Tersalin (pesan + link)
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3.5 w-3.5" />
                                    Salin Pesan + Link
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  shareMessage("wa", entry.name, entry.url)
                                }
                                className="inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-500/90 px-2.5 py-1.5 text-[11px] text-white hover:bg-emerald-500"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                                WA
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  shareMessage("native", entry.name, entry.url)
                                }
                                className="inline-flex items-center justify-center gap-1 rounded-lg bg-slate-700 px-2.5 py-1.5 text-[11px] text-slate-50 hover:bg-slate-600"
                              >
                                <Share2 className="h-3.5 w-3.5" />
                                Share
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  Belum ada hasil. Isi daftar nama di sebelah kiri (satu baris
                  satu nama), lalu klik{" "}
                  <span className="font-semibold">
                    Generate Semua Link &amp; QR
                  </span>
                  .
                </p>
              )}
            </motion.div>
          </div>

          <div className="mt-6 text-center text-[11px] text-slate-500">
            Dibuat dengan ❤️ untuk memudahkan EO & pasangan pengantin mengelola
            undangan digital — dari satu tamu sampai ratusan tamu sekaligus.
          </div>
        </motion.div>
      </main>
    </div>
  );
}
