import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Editions.css";
import { useAuth } from "./store/auth";

export default function Editions() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().substr(0, 10) // default today
  );
  const [editions, setEditions] = useState([]);
  const [currentEdition, setCurrentEdition] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { API } = useAuth();

  // Fetch edition when selectedDate changes
  useEffect(() => {
    const fetchEditionByDate = async () => {
      try {
        const res = await axios.get(
          `${API}/api/upload/data?date=${selectedDate}`
        );

        if (res.data && res.data.data && res.data.data.length > 0) {
          setCurrentEdition(res.data.data[0]); // pick the first edition of that day
          setCurrentPage(1);
        } else {
          setCurrentEdition(null);
        }
      } catch (err) {
        console.error("Error fetching edition:", err);
        setCurrentEdition(null);
      }
    };

    fetchEditionByDate();
  }, [selectedDate, API]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentEdition && currentPage < currentEdition.pages.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="editions-page">
      {/* Title */}
      <h1 className="editions-title">Editions</h1>

      {/* Calendar */}
      <div className="editions-top">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="date-selector"
        />
      </div>

      {/* Body */}
      <div className="editions-container">
        {/* Left: Page Slider */}
        <div className="page-slider">
          <button className="slider-btn left-btn" onClick={handlePrevPage}>
            {"<"}
          </button>

          <div className="newspaper-placeholder">
            {currentEdition ? (
              <img
                src={`${API}${currentEdition.pages[currentPage - 1]}`}
                alt={`Page ${currentPage}`}
                className="newspaper-image"
              />
            ) : (
              <p>No edition found for this date.</p>
            )}
          </div>

          <button className="slider-btn right-btn" onClick={handleNextPage}>
            {">"}
          </button>
        </div>

        {/* Right: Paper Info */}
        <div className="paper-info">
          {currentEdition ? (
            <>
              <h2>
                {currentEdition.title} - {formatDate(currentEdition.date)}
              </h2>
              <p>
                <strong>Publication Date:</strong>{" "}
                {formatDate(currentEdition.date)}
              </p>
              <p>
                <strong>Total Pages:</strong> {currentEdition.pages.length}
              </p>
              <a
                href={`${API}${currentEdition.pdfFile}`}
                target="_blank"
                rel="noopener noreferrer"
                className="download-btn"
              >
                Download PDF
              </a>
            </>
          ) : (
            <p>Please select a date with an available edition.</p>
          )}
        </div>
      </div>
    </div>
  );
}
