// SpecialEditions.jsx
import React, { useRef, useState, useEffect } from "react";
import "./Specials.css";
import { useLocation } from "react-router-dom";

const baseSpecials = [
  { title: "PharmaCare Special - August 2025", pdfUrl: "/pdfs/pharmacare_aug2025.pdf", year: 2025 },
  { title: "Health Today - July 2025", pdfUrl: "/pdfs/healthtoday_jul2025.pdf", year: 2025 },
  { title: "Medical Weekly - June 2024", pdfUrl: "/pdfs/medicalweekly_jun2024.pdf", year: 2024 },
  { title: "Wellness Monthly - May 2024", pdfUrl: "/pdfs/wellness_may2024.pdf", year: 2024 },
  { title: "Care Focus - April 2023", pdfUrl: "/pdfs/carefocus_apr2023.pdf", year: 2023 },
];

export default function SpecialEditions() {
  const tabsRef = useRef(null);
  const location = useLocation();

  const loadPersistedSpecials = () => {
    try {
      const raw = sessionStorage.getItem("specials_added");
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return parsed.map((s) => {
        const year = s.date ? Number(String(s.date).split("-")[0]) : new Date().getFullYear();
        return { title: s.title, pdfUrl: s.pdfUrl, year };
      });
    } catch (e) {
      console.warn("Failed to load persisted specials:", e);
      return [];
    }
  };

  const persisted = loadPersistedSpecials();
  const [specials, setSpecials] = useState(() => [...persisted, ...baseSpecials]);

  useEffect(() => {
    // if navigation state contains newSpecial, prepend it (dedupe by pdfUrl)
    const nav = location.state?.newSpecial;
    if (nav && nav.pdfUrl) {
      const year = nav.date ? Number(String(nav.date).split("-")[0]) : new Date().getFullYear();
      const normalized = { title: nav.title, pdfUrl: nav.pdfUrl, year };
      setSpecials((prev) => (prev.some((s) => s.pdfUrl === normalized.pdfUrl) ? prev : [normalized, ...prev]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const years = [...new Set(specials.map((e) => e.year))].sort((a, b) => b - a);
  const [selectedYear, setSelectedYear] = useState(null);

  const filteredEditions = selectedYear ? specials.filter((e) => e.year === Number(selectedYear)) : specials;

  const scrollLeft = () => { tabsRef.current?.scrollBy({ left: -300, behavior: "smooth" }); };
  const scrollRight = () => { tabsRef.current?.scrollBy({ left: 300, behavior: "smooth" }); };
  const handleOpenPDF = (pdfUrl) => { if (!pdfUrl) return alert("PDF not available"); window.open(pdfUrl, "_blank"); };

  return (
    <div className="special-page">
      <h1 className="special-title">Special Editions</h1>

      <div className="year-selector-container">
        <label htmlFor="year-selector">Select Year:</label>
        <select id="year-selector" value={selectedYear || ""} onChange={(e) => setSelectedYear(e.target.value || null)} className="year-selector">
          <option value="">All Years</option>
          {years.map((year, idx) => <option key={idx} value={year}>{year}</option>)}
        </select>
      </div>

      <div className="tabs-wrapper">
        <button className="scroll-btn left-scroll" onClick={scrollLeft}>{"<"}</button>
        <div className="tabs-container" ref={tabsRef}>
          {filteredEditions.length === 0 ? (
            <p className="no-editions">No special editions found for {selectedYear}</p>
          ) : (
            filteredEditions.map((edition, index) => (
              <div key={index} className="tab-card" onClick={() => handleOpenPDF(edition.pdfUrl)}>
                <div className="tab-preview"><p>Page 1</p></div>
                <h3 className="tab-title">{edition.title}</h3>
                <small>{edition.year}</small>
              </div>
            ))
          )}
        </div>
        <button className="scroll-btn right-scroll" onClick={scrollRight}>{">"}</button>
      </div>
    </div>
  );
}
