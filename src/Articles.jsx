// Articles.jsx
import React, { useState, useEffect } from "react";
import "./Articles.css";

export default function Articles({ language = "en" }) {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const API_BASE = "http://localhost:5000"; // change if needed

  // Fetch articles from backend
  const fetchArticles = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/articles?language=${language}`);
      const data = await res.json();
      setArticles(data);
    } catch (err) {
      console.error("Failed to fetch articles:", err);
    }
  };

  useEffect(() => {
    fetchArticles();

    // Optional: Polling every 10 seconds for live updates
    const interval = setInterval(fetchArticles, 10000);
    return () => clearInterval(interval);
  }, [language]);

  // Get unique categories from fetched articles
  const categories = [...new Set(articles.map((a) => a.category))];

  return (
    <section className="articles-page">
      <h1 className="page-heading">{language === "en" ? "Articles" : "लेख"}</h1>

      {categories.length === 0 && <p>{language === "en" ? "No articles found." : "कोणतेही लेख उपलब्ध नाहीत."}</p>}

      {categories.map((category, index) => (
        <div key={index} className="category-section">
          <h2 className="category-title">{category}</h2>

          <div className="scroll-container">
            {articles
              .filter((article) => article.category === category)
              .map((article, i) => (
                <div
                  key={i}
                  className="article-card"
                  onClick={() => setSelectedArticle(article)}
                >
                  <h3>{article.title}</h3>
                  <p>{new Date(article.date).toLocaleDateString()}</p>
                </div>
              ))}
          </div>
        </div>
      ))}

      {/* Modal Popup */}
      {selectedArticle && (
        <div className="modal-overlay" onClick={() => setSelectedArticle(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedArticle.title}</h2>
            <p className="modal-date">{new Date(selectedArticle.date).toLocaleDateString()}</p>
            <p className="modal-text">{selectedArticle.text}</p>
            <button onClick={() => setSelectedArticle(null)} className="close-btn">
              {language === "en" ? "Close" : "बंद करा"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
