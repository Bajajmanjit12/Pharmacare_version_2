// AdminPanel.jsx
import React, { useState, useEffect } from "react";
import "./AdminPanel.css";
import axios from "axios";
import { useAuth } from "./store/auth";

export default function AdminPanel({ onLogout }) {
  const [activeTab, setActiveTab] = useState("insert");
  const [editions, setEditions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [form, setForm] = useState({
    id: null,
    date: "",
    title: "",
    pages: [], // { url, file, existing: boolean, removed: boolean }
    pdf: null, // { url, file, existing: boolean, removed: boolean } | null
    special: false,
  });
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { API } = useAuth();

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3500);
  };

  // ---------- helpers ----------
  const normalizeDateOnly = (d) => {
    if (!d) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    const parsed = new Date(d);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, "0");
      const day = String(parsed.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }
    const dm = d.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (dm) return `${dm[3]}-${dm[2]}-${dm[1]}`;
    return d;
  };

  const stripApiPrefix = (urlOrPath) => {
    if (!urlOrPath) return urlOrPath;
    if (!API) return urlOrPath;
    // if full URL like `${API}/uploads/xxx.jpg` -> return `uploads/xxx.jpg`
    if (typeof urlOrPath === "string" && urlOrPath.startsWith(API)) {
      return urlOrPath.replace(new RegExp(`^${API}/?`), "");
    }
    return urlOrPath;
  };

  // ---------- FETCH EDITIONS ----------
  const fetchEditions = async () => {
    try {
      const res = await axios.get(`${API}/api/upload/all`);
      const data = res.data?.data || [];
      const normalized = data.map((ed) => {
        const rawDate = ed.date || ed.createdAt || "";
        const dateOnly = normalizeDateOnly(rawDate);
        return {
          id: ed._id,
          date: dateOnly,
          title: ed.title,
          // map pages to client page objects with `existing: true`
          pages: (ed.pages || []).map((p) => `${API}/${p}`),
          pdf: ed.pdfFile ? `${API}/${ed.pdfFile}` : null,
          special: !!ed.isSpecialEdition,
          _raw: ed,
        };
      });
      console.debug("Fetched editions (normalized):", normalized);
      setEditions(normalized);
    } catch (err) {
      console.error("Failed to fetch editions:", err);
      showMessage("Failed to load editions");
    }
  };

  useEffect(() => {
    fetchEditions();
    // eslint-disable-next-line
  }, []);

  // ---------- INSERT ----------
  const handleInsert = async (e) => {
    e.preventDefault();
    if (!form.date) return alert("Please select a date.");
    if (!form.pdf || !form.pdf.file) return alert("A PDF file is required.");

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title || "");
      formData.append("date", form.date);
      formData.append("isSpecialEdition", form.special ? "true" : "false");

      // append pdf and pages files
      if (form.pdf && form.pdf.file) formData.append("files", form.pdf.file);
      form.pages.forEach((p) => {
        if (p.file) formData.append("files", p.file);
      });

      const res = await axios.post(`${API}/api/upload/new`, formData);
      const saved = res.data?.data;
      if (saved) {
        const newEdition = {
          id: saved._id,
          date: normalizeDateOnly(saved.date || saved.createdAt || form.date),
          title: saved.title,
          pages: (saved.pages || []).map((p) => `${API}/${p}`),
          pdf: saved.pdfFile ? `${API}/${saved.pdfFile}` : null,
          special: saved.isSpecialEdition,
        };
        setEditions((prev) => [newEdition, ...prev]);
        setForm({ id: null, date: "", title: "", pages: [], pdf: null, special: false });
        showMessage("Inserted ✅");
        setActiveTab("update");
      } else {
        showMessage("Insert succeeded but server returned no data — re-fetching.");
        await fetchEditions();
      }
    } catch (err) {
      console.error("Insert failed:", err);
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // ---------- SELECT DATE -> PREFILL FORM FOR UPDATE (robust) ----------
  const handleSelectDateForUpdate = (dateValue) => {
    const normalized = normalizeDateOnly(dateValue);
    console.debug("Selecting date for update:", { input: dateValue, normalized });

    const existing = editions.find((ed) => normalizeDateOnly(ed.date) === normalized);
    if (existing) {
      console.debug("Found existing edition for date:", existing);
      setForm({
        id: existing.id || null,
        date: normalized,
        title: existing.title || "",
        // create page objects preserving url and mark as existing
        pages: (existing.pages || []).map((url) => ({ url, file: null, existing: true, removed: false })),
        pdf: existing.pdf ? { url: existing.pdf, file: null, existing: true, removed: false } : null,
        special: existing.special || false,
      });
    } else {
      console.debug("No existing edition found for date, prepare blank form.");
      setForm({ id: null, date: normalized, title: "", pages: [], pdf: null, special: false });
    }
  };

  // ---------- UPDATE ----------
  // REPLACE your existing handleUpdate with this
const handleUpdate = async (e) => {
  e.preventDefault();
  if (!form.date) return alert("Select date to update.");

  // If no backend id, perform insert instead of update.
  if (!form.id) {
    console.warn("No form.id set — performing INSERT instead of UPDATE.");
    return handleInsert(e);
  }

  setIsProcessing(true);
  try {
    const formData = new FormData();
    formData.append("title", form.title || "");
    formData.append("date", form.date);
    formData.append("isSpecialEdition", form.special ? "true" : "false");

    // existing pages to keep and to delete
    const existingPagesToKeep = form.pages
      .filter((p) => p.existing && !p.removed)
      .map((p) => stripApiPrefix(p.url));
    const existingPagesToDelete = form.pages
      .filter((p) => p.existing && p.removed)
      .map((p) => stripApiPrefix(p.url));

    if (existingPagesToKeep.length) {
      formData.append("existingPages", JSON.stringify(existingPagesToKeep));
      existingPagesToKeep.forEach((ep) => formData.append("existingPages[]", ep));
    } else {
      formData.append("existingPages", JSON.stringify([]));
    }

    if (existingPagesToDelete.length) {
      formData.append("deletedPages", JSON.stringify(existingPagesToDelete));
      existingPagesToDelete.forEach((dp) => formData.append("deletedPages[]", dp));
    }

    // add new page files
    form.pages.forEach((p) => {
      if (!p.existing && p.file) formData.append("files", p.file);
    });

    // pdf handling
    if (form.pdf) {
      if (form.pdf.existing && form.pdf.removed) {
        formData.append("removePdf", "true");
        formData.append("deletedPdf", stripApiPrefix(form.pdf.url));
      } else if (!form.pdf.existing && form.pdf.file) {
        formData.append("files", form.pdf.file);
      }
    }

    // method override field for servers that check body (harmless to include)
    formData.append("_method", "PUT");

    // debug snapshot (shows filenames and other small values)
    const fdSnapshot = {};
    formData.forEach((value, key) => {
      if (value instanceof File) fdSnapshot[key] = value.name;
      else fdSnapshot[key] = value;
    });
    console.debug("Prepared update FormData snapshot:", fdSnapshot);

    // 1) Try a real PUT first (most likely to match app.put('/api/upload/:id') on server)
    const putUrl = `${API}/api/upload/${form.id}`;
    console.debug("Attempting UPDATE with PUT ->", putUrl);

    try {
      // Do NOT set `Content-Type` manually; axios will set boundary correctly.
      const putRes = await axios.put(putUrl, formData);
      console.debug("PUT response:", putRes.status, putRes.data);

      const updated = putRes.data?.data;
      if (!updated) {
        console.warn("PUT succeeded but server returned no 'data' — re-fetching editions.");
        await fetchEditions();
        showMessage("Edition updated (re-fetched).");
      } else {
        const updatedEdition = {
          id: updated._id,
          date: normalizeDateOnly(updated.date || updated.createdAt || form.date),
          title: updated.title,
          pages: (updated.pages || []).map((p) => `${API}/${p}`),
          pdf: updated.pdfFile ? `${API}/${updated.pdfFile}` : null,
          special: !!updated.isSpecialEdition,
        };
        setEditions((prev) => prev.map((ed) => (ed.id === updatedEdition.id ? updatedEdition : ed)));
        showMessage("Edition updated ✏");
      }

      // clear and exit
      setForm({ id: null, date: "", title: "", pages: [], pdf: null, special: false });
      setActiveTab("update");
      return;
    } catch (putErr) {
      console.warn("PUT failed:", putErr?.response?.status, putErr?.response?.data || putErr.message);
      // if PUT returned 404 or method not allowed, we'll try a POST-based fallback below
    }

    // 2) Fallback: try POST with X-HTTP-Method-Override header (some servers accept this)
    // Use POST to the same resource + header override.
    const postUrl = `${API}/api/upload/${form.id}`;
    console.debug("Attempting fallback UPDATE with POST + X-HTTP-Method-Override ->", postUrl);

    try {
      const postRes = await axios.post(postUrl, formData, {
        headers: {
          "X-HTTP-Method-Override": "PUT",
          // do NOT set Content-Type manually; axios will set it for FormData
        },
      });
      console.debug("Fallback POST response:", postRes.status, postRes.data);

      const updated = postRes.data?.data;
      if (!updated) {
        await fetchEditions();
        showMessage("Edition updated (re-fetched).");
      } else {
        const updatedEdition = {
          id: updated._id,
          date: normalizeDateOnly(updated.date || updated.createdAt || form.date),
          title: updated.title,
          pages: (updated.pages || []).map((p) => `${API}/${p}`),
          pdf: updated.pdfFile ? `${API}/${updated.pdfFile}` : null,
          special: !!updated.isSpecialEdition,
        };
        setEditions((prev) => prev.map((ed) => (ed.id === updatedEdition.id ? updatedEdition : ed)));
        showMessage("Edition updated ✏");
      }

      setForm({ id: null, date: "", title: "", pages: [], pdf: null, special: false });
      setActiveTab("update");
      return;
    } catch (postErr) {
      console.error("Fallback POST failed:", postErr?.response?.status, postErr?.response?.data || postErr.message);
      // fallthrough to error handler below
      throw postErr;
    }
  } catch (err) {
    console.error("Update failed:", err);
    // local UI fallback so user sees something changed
    const pagesUrls = form.pages.map((p) => (p.file ? URL.createObjectURL(p.file) : p.url));
    const pdfUrl = form.pdf ? (form.pdf.file ? URL.createObjectURL(form.pdf.file) : form.pdf.url) : null;

    setEditions((prev) =>
      prev.map((ed) =>
        ed.id === form.id ? { ...ed, title: form.title, pages: pagesUrls, pdf: pdfUrl, special: form.special } : ed
      )
    );

    if (err.response) console.warn("Server response:", err.response.status, err.response.data);
    showMessage("Update failed (local changes applied)");
  } finally {
    setIsProcessing(false);
  }
};


  // ---------- DELETE EDITION ----------
  const handleDeleteEdition = async (date) => {
    const edition = editions.find((ed) => ed.date === date);
    if (!edition) return showMessage("Edition not found");
    if (!window.confirm("Delete this edition entirely?")) return;

    setEditions((prev) => prev.filter((ed) => ed.date !== date));
    showMessage("Edition removed locally 🗑");

    if (edition.id) {
      try {
        await axios.delete(`${API}/api/upload/${edition.id}`);
        showMessage("Deleted on server ✅");
      } catch (err) {
        console.error("Server delete failed:", err);
        showMessage("Failed to delete on server — re-syncing");
        fetchEditions();
      }
    }
  };

  // ---------- PAGE/PDF handlers (update-specific) ----------
  const markExistingPageRemoved = (index) => {
    const updated = [...form.pages];
    if (!updated[index]) return;
    updated[index] = { ...updated[index], removed: !updated[index].removed };
    setForm({ ...form, pages: updated });
  };

  const handleNewPagesSelected = (fileList) => {
    const filesArr = Array.from(fileList).map((f) => ({ url: URL.createObjectURL(f), file: f, existing: false, removed: false }));
    setForm({ ...form, pages: [...form.pages, ...filesArr] });
  };

  const removeNewPageAt = (index) => {
    const updated = [...form.pages];
    const p = updated[index];
    // if existing page, toggle removed; if new file, remove from array
    if (p.existing) {
      updated[index] = { ...p, removed: true };
    } else {
      updated.splice(index, 1);
    }
    setForm({ ...form, pages: updated });
  };

  const handlePageChange = (index, file) => {
    const updated = [...form.pages];
    updated[index] = { ...updated[index], file, url: URL.createObjectURL(file), existing: false, removed: false };
    setForm({ ...form, pages: updated });
  };

  const markPdfRemoved = () => {
    if (!form.pdf) return;
    setForm({ ...form, pdf: { ...form.pdf, removed: !form.pdf.removed } });
  };

  const handlePdfChange = (file) => {
    setForm({ ...form, pdf: { url: URL.createObjectURL(file), file, existing: false, removed: false } });
  };

  // ---------- MESSAGES ----------
  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API}/api/contact/all`);
      setMessages(res.data?.data || []);
    } catch (err) {
      console.error(err);
      showMessage("Failed to fetch messages");
    }
  };

  useEffect(() => {
    if (activeTab === "messages") fetchMessages();
    // eslint-disable-next-line
  }, [activeTab]);

  const handleDeleteMessage = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await axios.delete(`${API}/api/contact/${id}`);
      setMessages((prev) => prev.filter((m) => m._id !== id));
      showMessage("Message deleted 🗑");
    } catch (err) {
      console.error(err);
      showMessage("Failed to delete message");
    }
  };

  // ---------- Render ----------
  return (
    <div className="admin-root">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h3>PharmaCare Admin</h3>
        </div>
        {["insert", "update", "delete", "messages"].map((tab) => (
          <button key={tab} className={activeTab === tab ? "nav-item active" : "nav-item"} onClick={() => setActiveTab(tab)} disabled={isProcessing}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
        <button
          className="btn-logout"
          onClick={() => {
            onLogout && onLogout();
            window.location.href = "/";
          }}
          disabled={isProcessing}
        >
          Logout
        </button>
      </aside>

      <main className="admin-main">
        <header>
          <h1>📰 Admin Panel</h1>
          
        </header>

        <section className="table-section">
          {/* INSERT */}
          {activeTab === "insert" && (
            <form onSubmit={handleInsert} className="form-card">
              <label>Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              <label>Title</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <label>Upload Pages</label>
              <input type="file" multiple accept="image/*" onChange={(e) => setForm({ ...form, pages: Array.from(e.target.files).map((f) => ({ file: f, url: URL.createObjectURL(f), existing: false, removed: false })) })} />
              <label>Upload PDF</label>
              <input type="file" accept="application/pdf" onChange={(e) => setForm({ ...form, pdf: { file: e.target.files[0], url: URL.createObjectURL(e.target.files[0]), existing: false, removed: false } })} />
              <label>
                <input type="checkbox" checked={form.special} onChange={(e) => setForm({ ...form, special: e.target.checked })} /> Special Edition
              </label>
              <button type="submit" className="btn" disabled={isProcessing}>
                {isProcessing ? "Processing..." : "Insert Edition"}
              </button>
            </form>
          )}

          {/* UPDATE */}
          {activeTab === "update" && (
            <form onSubmit={handleUpdate} className="form-card">
              <label>Select Date to Update</label>
              <input type="date" value={form.date} onChange={(e) => handleSelectDateForUpdate(e.target.value)} required />

              {form.date && (
                <>
                  <label>Title</label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />

                  <label>Pages</label>
                  {form.pages.length === 0 && <p>No pages currently attached to this edition.</p>}

                  {form.pages.map((p, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <div style={{ width: 80, height: 80, overflow: "hidden" }}>
                        <img src={p.url} width="80" height="80" style={{ objectFit: "cover", opacity: p.removed ? 0.35 : 1, filter: p.removed ? "grayscale(80%)" : "none" }} alt={`page-${i}`} />
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div>
                          {p.existing ? (
                            <>
                              <small>Existing</small>
                              <button
                                type="button"
                                onClick={() => markExistingPageRemoved(i)}
                                className="btn small danger"
                                style={{ marginLeft: 8 }}
                              >
                                {p.removed ? "Undo Remove" : "Mark Remove"}
                              </button>
                            </>
                          ) : (
                            <>
                              <small>New file</small>
                              <button type="button" onClick={() => removeNewPageAt(i)} className="btn small danger" style={{ marginLeft: 8 }}>
                                Remove
                              </button>
                            </>
                          )}
                        </div>

                        <div style={{ display: "flex", gap: 8 }}>
                          <input type="file" accept="image/*" onChange={(e) => handlePageChange(i, e.target.files[0])} />
                        </div>
                      </div>
                    </div>
                  ))}

                  <label>Upload New Pages</label>
                  <input type="file" multiple accept="image/*" onChange={(e) => handleNewPagesSelected(e.target.files)} />

                  <label>PDF</label>
                  {form.pdf ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <embed src={form.pdf.url} width="100" height="80" style={{ opacity: form.pdf.removed ? 0.35 : 1 }} />
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div>
                          {form.pdf.existing ? (
                            <button type="button" onClick={markPdfRemoved} className="btn small danger">
                              {form.pdf.removed ? "Undo Remove PDF" : "Remove PDF"}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setForm({ ...form, pdf: null })}
                              className="btn small danger"
                            >
                              Remove New PDF
                            </button>
                          )}
                        </div>
                        <input type="file" accept="application/pdf" onChange={(e) => handlePdfChange(e.target.files[0])} />
                      </div>
                    </div>
                  ) : (
                    <input type="file" accept="application/pdf" onChange={(e) => handlePdfChange(e.target.files[0])} />
                  )}

                  <label>
                    <input type="checkbox" checked={form.special} onChange={(e) => setForm({ ...form, special: e.target.checked })} /> Special
                    Edition
                  </label>

                  <button type="submit" className="btn" disabled={isProcessing}>
                    {isProcessing ? "Processing..." : "Update Edition"}
                  </button>
                </>
              )}
            </form>
          )}

          {/* DELETE */}
          {activeTab === "delete" && (
            <div className="view-section">
              {editions.length === 0 ? (
                <p>No editions to delete.</p>
              ) : (
                editions.map((ed) => (
                  <div key={ed.date} className="edition-card">
                    <h3>
                      {ed.date} — {ed.title} {ed.special && "⭐"}
                    </h3>
                    <button className="btn danger" onClick={() => handleDeleteEdition(ed.date)}>
                      Delete Edition
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* MESSAGES */}
          {activeTab === "messages" && (
            <div className="view-section">
              {messages.length === 0 ? (
                <p>No messages received.</p>
              ) : (
                messages.map((msg) => (
                  <div key={msg._id} className="edition-card">
                    <h3>
                      {msg.name} ({msg.email})
                    </h3>
                    <p>{msg.message}</p>
                    <small>{new Date(msg.createdAt).toLocaleString()}</small>
                    <button className="btn danger" onClick={() => handleDeleteMessage(msg._id)}>
                      Delete Message
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
