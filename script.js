document.addEventListener('DOMContentLoaded', () => {
    // List of Names
    const predefinedEmployeeNames = [
        "MAO SIENGMENG", "JANELSO VINAITUONG", "PHENG AN", "ROBERT IBANEZ",
        "CHHET DEVITH", "LY CHHIN THEAN", "DOUNG CHANNNUOM", "NUOM POV PICH",
        "SIEM SAM NOEUN", "SOKA MANETH", "RIEM LINA", "SOR SIEVLY",
        "YOEURN NITA", "Seang Eang", "Roeurn Mab", "Khemara Davit",
        "KONG SREYPICH", "HUN RAVIN", "Suon Bunna", "Cheen Dara",
        "Mary Joy M. Ochinang", "Ericka Bheth B Cabral", "Allan S.Esteves",
        "Emil Esteves", "JESSA MEI PAGALAK", "Karen Patricia M.Godin",
        "Phoebe J.Tamot", "Raymond Ochinang", "Nan Sean Err", "LIV PHEAKDEY",
        "ART NEARDEY", "SENG CHHAY", "FOUYAN PHEA ROT", "MORNH SYPHAIK",
        "Y EM CHENDA", "CHEA SOCHEAT", "LEY LIMENGLY", "TENGKIT",
        "Prek Tararoth", "Van Ravuth", "IENG YATH", "Heng Lun",
        "Leakhena", "Ly Khy", "Tann herseang", "Keo Pich Piden",
        "VANN SOMONEA", "Chea Dana", "Un Nima", "HONG KUNTHEA",
        "KEO SOTHEA", "KIM VANDETH", "PHAY SOPHORSS", "SOEUR KEOPISEY",
        "KEV CHHENGLEANG", "MEAS MOLIKATOEUNG", "NICHKHOM LICHA", "CHEM TYTY",
        "MOEUN SEYHA", "NOUM PAOPUTHIDARA", "PHY SOKVANNARY", "LACH PHOUMARITH",
        "CHHEN VANYUTH", "PHATT CHHEALIN", "CHAN SREYTOCH", "KUN SREYNARA",
        "MESHDoung Vicheth", "Bav Oeurn", "Ngin Bora", "KHEAN VATHANAVITOU",
        "VANNA HOR", "Sopha Rathana", "SOVAN TYTY", "LOEM SIEUHOEU",
        "NG SONHENG", "SOK SOKUNTHEA", "ROLIV KOSOL", "NUON NGUN",
        "HONGKEOUN THEARAKORN", "MUNINT", "SOEM SARIFA", "HOEUY CHHUNEII",
        "JEVIN LAURON", "KHAN CHANSOVAN", "N NARITH", "ELSIE M. PRADO",
        "DK TEST", "DV TEST", "PHAT SREYENG", "HANG KIMHAK",
        "LORN SOKLY", "THIM CHHAN CHHAIN", "CHHORM VANTOEURN",
        "ROEUN SREYREP", "DKPATRECIA", "MAY GERBON", "JENELYN GELVEZON",
        "SEANG BONA", "HANG CHANRA", "POV PENG", "LONGTESTING",
        "POV PONNASIN", "SREYMOM", "GERSON STA ANA", "KHOEURN RATANAK",
        "LIEM MARASIN", "KAKADAPHON SAVY", "AIEN PUTHY", "YOU VEASNA",
        "Roeurn sokkheang", "JB Bernabe", "SORN SREYSAM", "VANN TINA",
        "CHREN SOVANRACHANA", "THONG KUNTHY", "SOT THARY", "REACH SREYMEY",
        "YANG KAKADA", "DORN DONG", "CHANN PISEY",
        "CHHUN PANHALA", "Y SENGDANA", "ROEURN CHHORK", "YEANG TEY"
    ];

    // Get elements with null checks
    const employeeNameSelect = document.getElementById('employeeNameSelect');
    const employeeNameInput = document.getElementById('employeeNameInput');
    const selectNameBtn = document.getElementById('selectNameBtn');
    const userNameDisplay = document.getElementById('userName');
    const checkInBtn = document.getElementById('checkInBtn');
    const breakBtn = document.getElementById('breakBtn');
    const resumeBtn = document.getElementById('resumeBtn');
    const checkOutBtn = document.getElementById('checkOutBtn');
    const checkInTimeDisplay = document.getElementById('checkInTime');
    const breakStartTimeDisplay = document.getElementById('breakStartTime');
    const breakEndTimeDisplay = document.getElementById('breakEndTime');
    const checkOutTimeDisplay = document.getElementById('checkOutTime');
    const totalWorkTimeDisplay = document.getElementById('totalWorkTime');
    const totalBreakTimeDisplay = document.getElementById('totalBreakTime');
    const netWorkTimeDisplay = document.getElementById('netWorkTime');
    const recordsList = document.getElementById('recordsList');
    const recordsTableBody = document.getElementById('recordsTableBody');
    const employeeLogsList = document.getElementById('employeeLogsList');
    const employeeLogs = document.getElementById('employeeLogs');
    const recordsSearch = document.getElementById('recordsSearch');
    const logsSearch = document.getElementById('logsSearch');

    // Verify critical elements exist
    if (!employeeNameSelect || !employeeNameInput || !recordsTableBody || !employeeLogs || !recordsSearch || !logsSearch) {
        console.error('One or more critical DOM elements are missing.');
        alert('Error: Page elements are missing. Please check the HTML structure.');
        return;
    }

    // Data structure to hold ALL employees' states, daily records, and action logs
    let allEmployeeData = {};
    let currentEmployeeName = null;

    // Populate the dropdown with predefined names
    predefinedEmployeeNames.sort().forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        employeeNameSelect.appendChild(option);
    });

    // --- Helper Functions ---

    // Format a Date object or timestamp to HH:MM:SS string
    const formatTime = (timestamp) => {
        if (!timestamp) return '--:--:--';
        try {
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) return '--:--:--';
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            return `${hours}:${minutes}:${seconds}`;
        } catch (e) {
            console.error('Error formatting time:', e);
            return '--:--:--';
        }
    };

    // Format a timestamp to YYYY-MM-DD
    const formatDate = (timestamp) => {
        if (!timestamp) return 'Invalid Date';
        try {
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) return 'Invalid Date';
            return date.toISOString().split('T')[0];
        } catch (e) {
            console.error('Error formatting date:', e);
            return 'Invalid Date';
        }
    };

    // Format duration in milliseconds to "X hours Y minutes" string
    const formatDuration = (milliseconds) => {
        if (milliseconds < 0 || isNaN(milliseconds)) milliseconds = 0;
        try {
            const totalSeconds = Math.floor(milliseconds / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);

            let result = '';
            if (hours > 0) {
                result += `${hours} hr${hours !== 1 ? 's' : ''} `;
            }
            result += `${minutes} min${minutes !== 1 ? 's' : ''}`;
            return result.trim() || '0 min';
        } catch (e) {
            console.error('Error formatting duration:', e);
            return '0 min';
        }
    };

    // Add a log entry for the current employee
    const addLogEntry = (employeeName, message) => {
        if (!employeeName || !message) {
            console.error('Invalid parameters for addLogEntry:', { employeeName, message });
            return;
        }
        if (!allEmployeeData[employeeName]) {
            allEmployeeData[employeeName] = { currentSession: null, dailyRecords: [], logs: [] };
        }
        const timestamp = new Date().getTime();
        allEmployeeData[employeeName].logs.push({
            timestamp,
            message: `${formatDate(timestamp)} ${formatTime(timestamp)}: ${message}`
        });
        saveAllData();
        if (employeeName === currentEmployeeName) {
            renderEmployeeLogs();
        }
    };

    // Render logs for the current employee or filtered by search
    const renderEmployeeLogs = () => {
        if (!employeeLogs || !employeeLogsList) {
            console.error('employeeLogs or employeeLogsList element is missing.');
            return;
        }
        employeeLogs.innerHTML = '';
        const searchTerm = logsSearch?.value.trim().toLowerCase() || '';

        let logsToDisplay = [];
        try {
            if (searchTerm) {
                Object.keys(allEmployeeData).forEach(name => {
                    if (name.toLowerCase().includes(searchTerm)) {
                        logsToDisplay.push(...(allEmployeeData[name].logs || []));
                    }
                });
            } else if (currentEmployeeName) {
                logsToDisplay = allEmployeeData[currentEmployeeName]?.logs || [];
            }

            if (!logsToDisplay.length) {
                employeeLogsList.classList.add('no-logs');
                employeeLogs.innerHTML = '<p class="no-logs">No logs available for this employee.</p>';
                return;
            }

            employeeLogsList.classList.remove('no-logs');
            logsToDisplay.sort((a, b) => b.timestamp - a.timestamp).forEach(log => {
                const li = document.createElement('li');
                li.textContent = log.message;
                employeeLogs.appendChild(li);
            });
        } catch (e) {
            console.error('Error rendering employee logs:', e);
            employeeLogsList.classList.add('no-logs');
            employeeLogs.innerHTML = '<p class="no-logs">Error loading logs. Please try again.</p>';
        }
    };

    // --- LocalStorage Management ---

    const LOCAL_STORAGE_KEY = 'employeeTimeTrackerAllData';
    const LAST_SELECTED_EMPLOYEE_KEY = 'lastSelectedEmployeeManual';

    const saveAllData = () => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allEmployeeData));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            alert('Could not save data. Local storage might be full or blocked.');
        }
    };

    const loadAllData = () => {
        try {
            const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedData) {
                allEmployeeData = JSON.parse(storedData);
                // Validate data structure
                Object.keys(allEmployeeData).forEach(name => {
                    if (!allEmployeeData[name].logs) allEmployeeData[name].logs = [];
                    if (!allEmployeeData[name].dailyRecords) allEmployeeData[name].dailyRecords = [];
                    if (!allEmployeeData[name].currentSession) allEmployeeData[name].currentSession = null;
                });
            }
        } catch (e) {
            console.error('Error loading from localStorage:', e);
            alert('Could not load data. Local storage might be corrupted.');
            allEmployeeData = {};
        }
    };

    // Initialize sample logs for testing
    const initializeSampleLogs = () => {
        const sampleEmployees = ['MAO SIENGMENG', 'Mary Joy M. Ochinang'];
        const now = new Date().getTime();
        const yesterday = now - 24 * 60 * 60 * 1000;
        
        sampleEmployees.forEach(name => {
            if (!allEmployeeData[name]) {
                allEmployeeData[name] = { currentSession: null, dailyRecords: [], logs: [] };
            }
            if (allEmployeeData[name].logs.length === 0) {
                allEmployeeData[name].logs = [
                    { timestamp: yesterday, message: `${formatDate(yesterday)} 08:00:00: Checked in at 08:00:00` },
                    { timestamp: yesterday + 30 * 60 * 1000, message: `${formatDate(yesterday)} 08:30:00: Started break at 08:30:00` },
                    { timestamp: yesterday + 45 * 60 * 1000, message: `${formatDate(yesterday)} 08:45:00: Ended break at 08:45:00` },
                    { timestamp: yesterday + 9 * 60 * 60 * 1000, message: `${formatDate(yesterday)} 17:00:00: Checked out at 17:00:00` },
                    { timestamp: now, message: `${formatDate(now)} ${formatTime(now)}: Selected ${name} at ${formatTime(now)}` }
                ];
                allEmployeeData[name].dailyRecords = [
                    {
                        checkInTimestamp: yesterday,
                        checkOutTimestamp: yesterday + 9 * 60 * 60 * 1000,
                        totalBreakDuration: 15 * 60 * 1000,
                        netWorkDuration: 8.75 * 60 * 60 * 1000
                    }
                ];
            }
        });
        saveAllData();
    };

    // --- UI Update and Logic Functions ---

    // Resets UI fields for the current session display
    const resetCurrentSessionUI = () => {
        if (checkInTimeDisplay) checkInTimeDisplay.textContent = '--:--:--';
        if (breakStartTimeDisplay) breakStartTimeDisplay.textContent = '--:--:--';
        if (breakEndTimeDisplay) breakEndTimeDisplay.textContent = '--:--:--';
        if (checkOutTimeDisplay) checkOutTimeDisplay.textContent = '--:--:--';
        if (totalWorkTimeDisplay) totalWorkTimeDisplay.textContent = '0 hours 0 minutes';
        if (totalBreakTimeDisplay) totalBreakTimeDisplay.textContent = '0 minutes';
        if (netWorkTimeDisplay) netWorkTimeDisplay.textContent = '0 hours 0 minutes';
    };

    // Updates the UI based on the current employee's session data
    const updateCurrentSessionUI = (data) => {
        if (!data || !data.currentSession) {
            resetCurrentSessionUI();
            return;
        }
        try {
            const session = data.currentSession;
            if (checkInTimeDisplay) checkInTimeDisplay.textContent = formatTime(session.checkInTimestamp);
            if (breakStartTimeDisplay) breakStartTimeDisplay.textContent = formatTime(session.breakStartTimestamp);
            if (breakEndTimeDisplay) breakEndTimeDisplay.textContent = session.lastBreakEndTimestamp ? formatTime(session.lastBreakEndTimestamp) : '--:--:--';
            if (checkOutTimeDisplay) checkOutTimeDisplay.textContent = formatTime(session.checkOutTimestamp);
            calculateCurrentResults(session);
        } catch (e) {
            console.error('Error updating current session UI:', e);
            resetCurrentSessionUI();
        }
    };

    // Update individual button states
    const updateButtonStates = (data) => {
        const isNameSelected = currentEmployeeName !== null && currentEmployeeName.trim() !== "";
        const hasCheckedIn = data && data.currentSession && data.currentSession.checkInTimestamp !== null;
        const onBreak = data && data.currentSession && data.currentSession.breakStartTimestamp !== null;
        const hasCheckedOut = data && data.currentSession && data.currentSession.checkOutTimestamp !== null;

        if (selectNameBtn) selectNameBtn.disabled = !isNameSelected;
        if (checkInBtn) checkInBtn.disabled = !isNameSelected || hasCheckedIn || hasCheckedOut;
        if (breakBtn) breakBtn.disabled = !hasCheckedIn || onBreak || hasCheckedOut;
        if (resumeBtn) {
            resumeBtn.disabled = !onBreak;
            resumeBtn.style.display = onBreak ? 'inline-block' : 'none';
        }
        if (checkOutBtn) checkOutBtn.disabled = !hasCheckedIn || onBreak || hasCheckedOut;
    };

    // Renders all employee records to the table, filtered by search
    const renderAllRecords = () => {
        if (!recordsTableBody) {
            console.error('recordsTableBody element is missing.');
            return;
        }
        recordsTableBody.innerHTML = '';
        const searchTerm = recordsSearch?.value.trim().toLowerCase() || '';

        try {
            const allKnownNames = new Set(predefinedEmployeeNames);
            Object.keys(allEmployeeData).forEach(name => allKnownNames.add(name));

            const employeeNamesToDisplay = Array.from(allKnownNames)
                .filter(name => !searchTerm || name.toLowerCase().includes(searchTerm))
                .sort((a, b) => a.localeCompare(b));

            const recordsAvailable = employeeNamesToDisplay.some(name => {
                const data = allEmployeeData[name];
                return (data && data.dailyRecords && data.dailyRecords.length > 0) || (data && data.currentSession && data.currentSession.checkInTimestamp);
            });

            if (!recordsAvailable) {
                recordsTableBody.innerHTML = `<tr><td colspan="4" class="no-records">No records found${searchTerm ? ' for "' + searchTerm + '"' : ''}. Enter a name and track time!</td></tr>`;
                return;
            }

            employeeNamesToDisplay.forEach(name => {
                const employeeData = allEmployeeData[name] || { currentSession: null, dailyRecords: [] };
                const dailyRecords = employeeData.dailyRecords || [];

                if (dailyRecords.length === 0 && (!employeeData.currentSession || !employeeData.currentSession.checkInTimestamp)) {
                    return;
                }

                if (employeeData.currentSession && employeeData.currentSession.checkInTimestamp && !employeeData.currentSession.checkOutTimestamp) {
                    const currentSession = employeeData.currentSession;
                    let totalBreakDuration = currentSession.totalBreakDuration || 0;
                    if (currentSession.breakStartTimestamp) {
                        totalBreakDuration += (new Date().getTime() - currentSession.breakStartTimestamp);
                    }
                    totalBreakDuration = Math.max(0, totalBreakDuration);
                    const row = document.createElement('tr');
                    row.classList.add('current-session');
                    row.innerHTML = `
                        <td>${name} <span style="color: #90EE90; font-size: 0.8em;">(Current)</span></td>
                        <td>${formatTime(currentSession.checkInTimestamp)}</td>
                        <td>${formatDuration(totalBreakDuration)}</td>
                        <td>${formatTime(currentSession.checkOutTimestamp)}</td>
                    `;
                    recordsTableBody.appendChild(row);
                }

                dailyRecords.sort((a, b) => (b.checkInTimestamp || 0) - (a.checkInTimestamp || 0));

                dailyRecords.forEach(day => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${name}</td>
                        <td>${formatTime(day.checkInTimestamp)}</td>
                        <td>${formatDuration(day.totalBreakDuration)}</td>
                        <td>${formatTime(day.checkOutTimestamp)}</td>
                    `;
                    recordsTableBody.appendChild(row);
                });
            });
        } catch (e) {
            console.error('Error rendering records:', e);
            recordsTableBody.innerHTML = `<tr><td colspan="4" class="no-records">Error loading records. Please try again.</td></tr>`;
        }
    };

    // Calculates and displays results for the current session
    const calculateCurrentResults = (sessionData) => {
        try {
            if (!sessionData || !sessionData.checkInTimestamp) {
                if (totalWorkTimeDisplay) totalWorkTimeDisplay.textContent = '0 hours 0 minutes';
                if (totalBreakTimeDisplay) totalBreakTimeDisplay.textContent = '0 minutes';
                if (netWorkTimeDisplay) netWorkTimeDisplay.textContent = '0 hours 0 minutes';
                return;
            }

            let totalWorkDuration = 0;
            const effectiveEndTime = sessionData.checkOutTimestamp || new Date().getTime();
            totalWorkDuration = effectiveEndTime - sessionData.checkInTimestamp;

            let actualBreakDuration = sessionData.totalBreakDuration || 0;
            if (sessionData.breakStartTimestamp && !sessionData.checkOutTimestamp) {
                actualBreakDuration += (new Date().getTime() - sessionData.breakStartTimestamp);
            }
            actualBreakDuration = Math.max(0, actualBreakDuration);

            let netWorkDuration = totalWorkDuration - actualBreakDuration;
            netWorkDuration = Math.max(0, netWorkDuration);

            if (totalWorkTimeDisplay) totalWorkTimeDisplay.textContent = formatDuration(totalWorkDuration);
            if (totalBreakTimeDisplay) totalBreakTimeDisplay.textContent = formatDuration(actualBreakDuration);
            if (netWorkTimeDisplay) netWorkTimeDisplay.textContent = formatDuration(netWorkDuration);
        } catch (e) {
            console.error('Error calculating results:', e);
            if (totalWorkTimeDisplay) totalWorkTimeDisplay.textContent = 'Error';
            if (totalBreakTimeDisplay) totalBreakTimeDisplay.textContent = 'Error';
            if (netWorkTimeDisplay) netWorkTimeDisplay.textContent = 'Error';
        }
    };

    // --- Action Handlers ---

    // Handles selecting an employee from the dropdown or input field
    const handleSelectEmployee = () => {
        const inputType = document.querySelector('input[name="inputType"]:checked')?.value;
        if (!inputType) {
            console.error('No input type selected.');
            alert('Please select an input method (Dropdown or Manual).');
            return;
        }

        let name = '';
        if (inputType === 'select') {
            name = employeeNameSelect.value;
        } else {
            name = employeeNameInput.value.trim().toUpperCase();
        }

        if (!name) {
            alert("Please select or enter an employee name.");
            return;
        }

        currentEmployeeName = name;
        if (userNameDisplay) userNameDisplay.textContent = name;
        localStorage.setItem(LAST_SELECTED_EMPLOYEE_KEY, name);

        if (!allEmployeeData[name]) {
            allEmployeeData[name] = { currentSession: null, dailyRecords: [], logs: [] };
        }
        addLogEntry(name, `Selected ${name} at ${formatTime(new Date().getTime())}`);
        updateCurrentSessionUI(allEmployeeData[name]);
        updateButtonStates(allEmployeeData[name]);
        renderAllRecords();
        renderEmployeeLogs();
        alert(`Now tracking for employee: ${name}`);
    };

    // Toggle between dropdown and manual input
    document.querySelectorAll('input[name="inputType"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const inputType = radio.value;
            if (inputType === 'select') {
                employeeNameSelect.style.display = 'block';
                employeeNameInput.style.display = 'none';
                selectNameBtn.disabled = employeeNameSelect.value === '';
            } else {
                employeeNameSelect.style.display = 'none';
                employeeNameInput.style.display = 'block';
                selectNameBtn.disabled = employeeNameInput.value.trim() === '';
            }
        });
    });

    // Update button state when dropdown or input changes
    employeeNameSelect.addEventListener('change', () => {
        selectNameBtn.disabled = employeeNameSelect.value === '';
    });

    employeeNameInput.addEventListener('input', () => {
        selectNameBtn.disabled = employeeNameInput.value.trim() === '';
    });

    // Search handlers with debouncing
    let searchTimeout = null;
    const debounceSearch = (callback, delay = 300) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(callback, delay);
    };

    if (recordsSearch) {
        recordsSearch.addEventListener('input', () => {
            debounceSearch(() => renderAllRecords());
        });
    }

    if (logsSearch) {
        logsSearch.addEventListener('input', () => {
            debounceSearch(() => renderEmployeeLogs());
        });
    }

    // Button event listeners
    if (checkInBtn) {
        checkInBtn.addEventListener('click', () => {
            if (!currentEmployeeName) {
                alert("Please select an employee first by selecting or typing their name and clicking 'Select Name'.");
                return;
            }
            const data = allEmployeeData[currentEmployeeName];
            if (!data.currentSession || !data.currentSession.checkInTimestamp) {
                const now = new Date();
                data.currentSession = {
                    checkInTimestamp: now.getTime(),
                    breakStartTimestamp: null,
                    totalBreakDuration: 0,
                    lastBreakEndTimestamp: null,
                    checkOutTimestamp: null
                };
                if (checkInTimeDisplay) checkInTimeDisplay.textContent = formatTime(now.getTime());
                addLogEntry(currentEmployeeName, `Checked in at ${formatTime(now.getTime())}`);
                saveAllData();
                updateButtonStates(data);
                calculateCurrentResults(data.currentSession);
                renderAllRecords();
                alert(`${currentEmployeeName} checked in at ${formatTime(now.getTime())}`);
            }
        });
    }

    if (breakBtn) {
        breakBtn.addEventListener('click', () => {
            if (!currentEmployeeName) {
                alert("Please select an employee first.");
                return;
            }
            const data = allEmployeeData[currentEmployeeName];
            const session = data.currentSession;
            if (session && session.checkInTimestamp && !session.breakStartTimestamp && !session.checkOutTimestamp) {
                const now = new Date();
                session.breakStartTimestamp = now.getTime();
                if (breakStartTimeDisplay) breakStartTimeDisplay.textContent = formatTime(now.getTime());
                addLogEntry(currentEmployeeName, `Started break at börja ${formatTime(now.getTime())}`);
                saveAllData();
                updateButtonStates(data);
                alert(`${currentEmployeeName} started break at ${formatTime(now.getTime())}`);
            } else if (!session || !session.checkInTimestamp) {
                alert("Please check in first.");
            } else if (session.checkOutTimestamp) {
                alert("Employee has already checked out.");
            }
        });
    }

    if (resumeBtn) {
        resumeBtn.addEventListener('click', () => {
            if (!currentEmployeeName) {
                alert("Please select an employee first.");
                return;
            }
            const data = allEmployeeData[currentEmployeeName];
            const session = data.currentSession;
            if (session && session.breakStartTimestamp) {
                const now = new Date();
                session.lastBreakEndTimestamp = now.getTime();
                session.totalBreakDuration += (session.lastBreakEndTimestamp - session.breakStartTimestamp);
                session.breakStartTimestamp = null;
                if (breakEndTimeDisplay) breakEndTimeDisplay.textContent = formatTime(now.getTime());
                addLogEntry(currentEmployeeName, `Ended break at ${formatTime(now.getTime())}`);
                saveAllData();
                updateButtonStates(data);
                calculateCurrentResults(session);
                alert(`${currentEmployeeName} ended break at ${formatTime(now.getTime())}`);
            } else {
                alert("Employee is not currently on break.");
            }
        });
    }

    if (checkOutBtn) {
        checkOutBtn.addEventListener('click', () => {
            if (!currentEmployeeName) {
                alert("Please select an employee first.");
                return;
            }
            const data = allEmployeeData[currentEmployeeName];
            const session = data.currentSession;

            if (session && session.breakStartTimestamp) {
                alert("Please end your break before checking out!");
                return;
            }
            if (session && session.checkInTimestamp && !session.checkOutTimestamp) {
                const now = new Date();
                session.checkOutTimestamp = now.getTime();

                const totalWork = session.checkOutTimestamp - session.checkInTimestamp;
                const netWork = totalWork - (session.totalBreakDuration || 0);

                if (!data.dailyRecords) data.dailyRecords = [];
                data.dailyRecords.push({
                    checkInTimestamp: session.checkInTimestamp,
                    checkOutTimestamp: session.checkOutTimestamp,
                    totalBreakDuration: session.totalBreakDuration || 0,
                    netWorkDuration: netWork
                });

                addLogEntry(currentEmployeeName, `Checked out at ${formatTime(now.getTime())}`);
                data.currentSession = null;
                if (checkOutTimeDisplay) checkOutTimeDisplay.textContent = formatTime(now.getTime());
                saveAllData();
                calculateCurrentResults(null);
                updateButtonStates(data);
                renderAllRecords();
                renderEmployeeLogs();
                alert(`${currentEmployeeName} checked out at ${formatTime(now.getTime())}. Net Work: ${formatDuration(netWork)}`);
                if (userNameDisplay) userNameDisplay.textContent = "-- Not Selected --";
                currentEmployeeName = null;
                employeeNameSelect.value = '';
                employeeNameInput.value = '';
            } else if (!session || !session.checkInTimestamp) {
                alert("Employee has not checked in yet.");
            } else if (session.checkOutTimestamp) {
                alert("Employee has already checked out for today.");
            }
        });
    }

    // --- Initialization ---

    try {
        loadAllData();
        initializeSampleLogs();

        selectNameBtn.addEventListener('click', handleSelectEmployee);
        employeeNameInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                handleSelectEmployee();
            }
        });

        const lastSelectedName = localStorage.getItem(LAST_SELECTED_EMPLOYEE_KEY);
        if (lastSelectedName) {
            if (predefinedEmployeeNames.includes(lastSelectedName)) {
                employeeNameSelect.value = lastSelectedName;
            } else {
                employeeNameInput.value = lastSelectedName;
                document.querySelector('input[name="inputType"][value="manual"]').checked = true;
                employeeNameSelect.style.display = 'none';
                employeeNameInput.style.display = 'block';
            }
            handleSelectEmployee();
        } else {
            resetCurrentSessionUI();
            updateButtonStates(null);
            if (userNameDisplay) userNameDisplay.textContent = "-- Not Selected --";
            renderEmployeeLogs();
        }

        renderAllRecords();

        setInterval(() => {
            if (currentEmployeeName && allEmployeeData[currentEmployeeName]?.currentSession?.checkInTimestamp && !allEmployeeData[currentEmployeeName]?.currentSession?.checkOutTimestamp) {
                calculateCurrentResults(allEmployeeData[currentEmployeeName].currentSession);
                renderAllRecords();
            }
        }, 1000);
    } catch (e) {
        console.error('Initialization error:', e);
        alert('Error initializing the application. Please refresh the page.');
    }
});