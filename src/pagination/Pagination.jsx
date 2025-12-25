const Pagination = ({ page, setPage, hasNextpage }) => {
  return (
    <div className="flex justify-center gap-3 mt-6 mb-6">
      <button
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
        className={`px-4 py-2 rounded-lg border text-sm transition ${
          page === 1
            ? "border-gray-200 bg-white text-gray-400 cursor-not-allowed"
            : "border-gray-300 bg-blue-100 text-gray-600 hover:bg-blue-200"
        }`}
      >
        Previous
      </button>

      <button className="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium shadow text-sm cursor-default">
        {page}
      </button>

      <button
        onClick={() => setPage(page + 1)}
        disabled={!hasNextpage}
        className={`px-4 py-2 rounded-lg border text-sm transition ${
          !hasNextpage
            ? "border-gray-200 bg-white text-gray-400 cursor-not-allowed"
            : "border-gray-300 bg-blue-100 text-gray-600 hover:bg-blue-200"
        }`}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
