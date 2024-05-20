import React, { useState, useEffect } from 'react';
import {
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    format,
    subMonths,
    addMonths,
    isWeekend,
    startOfWeek,
    endOfWeek
} from 'date-fns';
import './Calendar.css';

const Tooltip = ({ text, isVisible }) => {
    return (
        <div className={`tooltip ${isVisible ? 'visible' : ''}`}>
            {text}
        </div>
    );
};


const Calendar = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selections, setSelections] = useState(() => {
        const savedSelections = localStorage.getItem('calendarSelections');
        return savedSelections ? JSON.parse(savedSelections) : {};
    });
    const [summaryDate, setSummaryDate] = useState(new Date()); // Default to today's date
    const [showTooltip, setShowTooltip] = useState(false);

    const exportSelections = () => {
        const data = JSON.stringify(selections);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'calendarSelections.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const importSelections = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            const data = reader.result;
            setSelections(JSON.parse(data));
        };
        reader.readAsText(file);
    };


    useEffect(() => {
        localStorage.setItem('calendarSelections', JSON.stringify(selections));
    }, [selections]);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

    const handleSelectionChange = (date, event) => {
        setSelections({
            ...selections,
            [date]: event.target.value,
        });
    };

    const handlePreviousMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    const calculateInOfficePercentage = (date) => {
        const pastTwelveWeeksStart = subMonths(date, 3);
        const pastTwelveWeeks = eachDayOfInterval({ start: pastTwelveWeeksStart, end: date });

        let totalDays = 0;
        let inOfficeDays = 0;

        pastTwelveWeeks.forEach(day => {
            const formattedDate = format(day, 'yyyy-MM-dd');
            if (!isWeekend(day) && selections[formattedDate] !== 'Marked Absent' && selections[formattedDate] !== 'Holiday') {
                totalDays += 1;
            }
            if (selections[formattedDate] === 'In-Office' || selections[formattedDate] === 'Marked Absent' || selections[formattedDate] === 'Holiday') {
                inOfficeDays += 1;
            }
        });

        return totalDays > 0 ? Math.round((inOfficeDays / totalDays) * 100) : 0;
    };

    const renderWeekDays = () => {
        const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return weekDays.map((day) => (
            <div key={day} className="calendar-weekday">
                {day}
            </div>
        ));
    };

    const getCellColor = (inOfficePercentage) => {
        if (inOfficePercentage < 60) {
            return 'red';
        } else if (inOfficePercentage >= 60 && inOfficePercentage <= 65) {
            return 'yellow';
        } else {
            return 'green';
        }
    };

    const handleSummaryDateChange = (date) => {
        setSummaryDate(date);
    };

    const summaryData = () => {
        const twelveWeeksAgo = subMonths(summaryDate, 3);
        const pastTwelveWeeks = eachDayOfInterval({ start: twelveWeeksAgo, end: summaryDate });
        let inOfficeDays = 0;
        let approvedDays = 0;
        let holidaysCount = 0;
        let markedAbsentCount = 0;

        pastTwelveWeeks.forEach(day => {
            const formattedDate = format(day, 'yyyy-MM-dd');
            if (!isWeekend(day)) {
                if (selections[formattedDate] === 'In-Office') {
                    inOfficeDays += 1;
                } else if (selections[formattedDate] === 'Marked Absent') {
                    markedAbsentCount += 1;
                } else if (selections[formattedDate] === 'Holiday') {
                    holidaysCount += 1;
                }
            }
        });

        approvedDays = markedAbsentCount + holidaysCount;
        const totalAttendance = inOfficeDays + approvedDays;
        const eligibleBusinessDays = 60;

        return (
            <div className="summary">
                <h3>Summary for {format(summaryDate, 'MMMM dd, yyyy')}</h3>
                <input
                    type="date"
                    value={format(summaryDate, 'yyyy-MM-dd')}
                    onChange={(e) => handleSummaryDateChange(new Date(e.target.value))}
                />
                <p>In-Office Days: {inOfficeDays}</p>
                <p>
                    Approved Days:
                    <span className="tooltip-container">
                        {approvedDays}
                        <span className="info-icon" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
                            ℹ
                            <Tooltip text={`Holidays: ${holidaysCount}, Marked Absent: ${markedAbsentCount}`} isVisible={showTooltip} />
                        </span>
                    </span>
                </p>
                <p>Total Attendance: {totalAttendance}</p>
                <p>Eligible Business Days: {eligibleBusinessDays}</p>
                <div classname="summary-controls">
                    <button onClick={exportSelections}>Export</button>
                    <input type="file" accept=".json" onChange={importSelections} />
                </div>
            </div>
        );
    };



    return (
        <div className="calendar-container">
            <div className="calendar">
                <h2>{format(currentMonth, 'MMMM yyyy')}</h2>
                <div className="calendar-grid">
                    {renderWeekDays()}
                    {daysInMonth.map((date) => {
                        const formattedDate = format(date, 'yyyy-MM-dd');
                        const inOfficePercentage = calculateInOfficePercentage(date);
                        const isWeekendDay = isWeekend(date);
                        const cellColor = getCellColor(inOfficePercentage);

                        return (
                            <div
                                key={formattedDate}
                                className={`calendar-date ${isWeekendDay ? 'weekend' : ''} ${cellColor}`}
                            >
                                <span>{format(date, 'd')}</span>
                                {!isWeekendDay && (
                                    <>
                                        <select
                                            value={selections[formattedDate] || 'WFH'}
                                            onChange={(event) => handleSelectionChange(formattedDate, event)}
                                        >
                                            <option value="WFH">WFH</option>
                                            <option value="In-Office">In-Office</option>
                                            <option value="Marked Absent">Marked Absent</option>
                                            <option value="Off but Not Marked Absent">Off but Not Marked Absent</option>
                                            <option value="Holiday">Holiday</option>
                                        </select>
                                        <div className="percentage">
                                            {inOfficePercentage}% In-Office
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="calendar-controls">
                    <button onClick={handlePreviousMonth}>Previous</button>
                    <button onClick={handleNextMonth}>Next</button>
                </div>
            </div>
            {summaryData()}
        </div>
    );
};

export default Calendar;
