import React, { useState, useEffect } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { main, dark, light } from "../../style";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

const Pagination = ({ data, theme, limit, setPagination, numberOnly, table, triggerSearch }) => {
    const [searchParams, setSearchParams] = useSearchParams();

    const navigate          = useNavigate()
    let pageIndex           = searchParams.get('page') ? parseInt(searchParams.get('page')) : 1
    const itemsPerPage      = limit ?? 10; 
    const totalPages        = Math.ceil(data?.length / itemsPerPage);

    const [currentPage, setCurrentPage] = useState(pageIndex);
    const [displayedPages, setDisplayedPages] = useState([]);

    const startIndex        = (currentPage - 1) * itemsPerPage;
    const endIndex          = startIndex + itemsPerPage;

    useEffect(() => {
        const search = new URLSearchParams(window.location.search);
        search.set('page', 1); 

        const newUrl = `${window.location.pathname}?${search.toString()}`;
        window.history.replaceState(null, '', newUrl);

        handlePageChange(1)
    }, [triggerSearch])

    useEffect(() => {
        if(!table) {
            window.scrollTo(0, 0)
        }
    
        const calculateDisplayedPages = () => {
            const pagesToShow = [];
            const maxDisplayedPages = 6;
    
            if (totalPages <= maxDisplayedPages) {
                for (let i = 1; i <= totalPages; i++) {
                    pagesToShow.push(i);
                }
            } 
            else {
                let startPage;
                let endPage;
        
                if (currentPage <= Math.floor(maxDisplayedPages / 2)) {
                    startPage = 1;
                    endPage = maxDisplayedPages;
                } else if (currentPage >= totalPages - Math.floor(maxDisplayedPages / 2)) {
                    startPage = totalPages - maxDisplayedPages + 1;
                    endPage = totalPages;
                } else {
                    startPage = currentPage - Math.floor(maxDisplayedPages / 2);
                    endPage = currentPage + Math.floor(maxDisplayedPages / 2);
                }
        
                for (let i = startPage; i <= endPage; i++) {
                    pagesToShow.push(i);
                }
            }
    
            setDisplayedPages(pagesToShow);
        };
    
        calculateDisplayedPages();
    }, [currentPage, totalPages]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);

        const searchParams = new URLSearchParams(window.location.search);
        const start        = (pageNumber - 1) * itemsPerPage;
        const end          = start + itemsPerPage;

        searchParams.set('page', pageNumber);
        
        setPagination({
            start   : start,
            end     : end
        })
        
        navigate(`${window.location.pathname}?${searchParams.toString()}`);
    };

    return (
        <div className='flex flex-wrap items-center justify-center gap-2'>
            {
                !numberOnly ?
                    <button
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={`${theme === 'light' ? light.paginate_btn : dark.paginate_btn}`}
                    >
                        Previous
                    </button>
                : null
            }
            {displayedPages.map((pageNumber) => (
                <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    style={{backgroundColor: pageIndex === pageNumber && "#2563eb", color: pageIndex === pageNumber && "#FFF"}}
                    className={`${theme === 'light' ? light.paginate_btn : dark.paginate_btn} ${table ? (theme === 'light' ? light.semibackground : dark.semibackground) : ''}`}
                >
                    {pageNumber}
                </button>
            ))}
            {
                !numberOnly ?
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={`${theme === 'light' ? light.paginate_btn : dark.paginate_btn}`}
                    >
                        Next
                    </button>
                : null
            }
        </div>
    );
}

export default Pagination