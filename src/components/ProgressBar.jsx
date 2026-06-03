import React from "react";
export default function ProgressBar({ pages, currentPage }) {
  return (
    <div className="progress">
      {pages.map((page, index) => (
        <div
          key={page}
          className={`progress-item ${
            index === currentPage ? "active" : index < currentPage ? "done" : ""
          }`}
        >
          <span>{index + 1}</span>
          <p>{page}</p>
        </div>
      ))}
    </div>
  );
}