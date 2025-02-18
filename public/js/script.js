document.addEventListener('DOMContentLoaded', () => {
    const juegoFiles = ['data/genshin.json', 'data/starrail.json', 'data/zzz.json', 'data/snowbreak.json', 'data/wuthering.json'];
    let events = [];
    let currentFilter = null;

    const juegoPriority = { 'Genshin': 1, 'Star Rail': 2, 'ZZZ': 3, 'Snowbreak': 4, 'Wuthering': 5 };
    const tipoPriority = { 'Eventos': 1, 'Banners': 2, 'Abyss': 3 };

    let startDate, endDate, daysCount, currentDate;
    const timelineMonthHeader = document.getElementById('timeline-month-header');
    const timelineHeader = document.getElementById('timeline-header');
    const timelineContent = document.getElementById('timeline-content');
    const currentTimeCursor = document.getElementById('current-time-cursor');
    const currentTimeLabel = document.getElementById('current-time-label');

    function positionEvents(eventsToPosition = events) {
        timelineContent.innerHTML = ''; // Limpiar contenido anterior
        eventsToPosition.forEach((event, index) => {
            const eventStartDate = new Date(event.start);
            const eventEndDate = new Date(event.end);
            const startDayOffset = Math.floor((eventStartDate - startDate) / (1000 * 60 * 60 * 24));
            const duration = Math.floor((eventEndDate - eventStartDate) / (1000 * 60 * 60 * 24)) + 1;

            const eventDiv = document.createElement('div');
            eventDiv.className = 'event';
            eventDiv.style.gridColumn = `${startDayOffset + 1} / span ${duration}`;
            eventDiv.style.gridRow = index + 1;

            const eventTitle = document.createElement('h2');
            eventTitle.textContent = event.title;
            eventDiv.appendChild(eventTitle);

            const eventImage = document.createElement('img');
            eventImage.src = event.image;
            eventImage.className = event.imgClass;
            eventDiv.appendChild(eventImage);

            timelineContent.appendChild(eventDiv);
        });
    }

    function initializeTimeline() {
        function calculateTimelineDays() {
            const now = new Date();
            currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            startDate = new Date(currentDate);
            startDate.setDate(currentDate.getDate() - 30);
            endDate = new Date(currentDate);
            endDate.setDate(currentDate.getDate() + 50);
            daysCount = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        }

        calculateTimelineDays();

        const dayWidth = 100;
        timelineHeader.style.gridTemplateColumns = `repeat(${daysCount}, ${dayWidth}px)`;
        timelineContent.style.gridTemplateColumns = `repeat(${daysCount}, ${dayWidth}px)`;
        timelineMonthHeader.style.gridTemplateColumns = `repeat(${daysCount}, ${dayWidth}px)`;

        // Función para generar los meses correctamente sincronizados con los días
        function generateMonths() {
            let currentMonth = startDate.getMonth();
            let monthStart = 0;
            const monthColors = ['#FFCDD2', '#F8BBD0', '#E1BEE7', '#D1C4E9', '#C5CAE9'];
            let currentColorIndex = 0;

            for (let i = 0; i <= daysCount; i++) {
                const currentDay = new Date(startDate);
                currentDay.setDate(startDate.getDate() + i);

                if (currentDay.getMonth() !== currentMonth || i === daysCount) {
                    const monthDiv = document.createElement('div');
                    monthDiv.className = 'month-divider';
                    monthDiv.textContent = new Date(startDate.getFullYear(), currentMonth).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
                    monthDiv.style.gridColumn = `${monthStart + 1} / span ${i - monthStart}`;
                    monthDiv.style.backgroundColor = monthColors[currentColorIndex % monthColors.length];

                    timelineMonthHeader.appendChild(monthDiv);

                    currentMonth = currentDay.getMonth();
                    monthStart = i;
                    currentColorIndex++;
                }
            }
        }

        // Genera los divisores de días automáticamente sincronizados
        function generateDays() {
            for (let i = 0; i < daysCount; i++) {
                const dayDiv = document.createElement('div');
                const currentDay = new Date(startDate);
                currentDay.setDate(startDate.getDate() + i);

                dayDiv.className = 'day-divider';
                dayDiv.textContent = currentDay.getDate();

                timelineHeader.appendChild(dayDiv);
            }
        }

        // Posiciona los eventos correctamente basados en la misma lógica de fecha
        function positionEvents() {
            events.forEach((event, index) => {
                const eventStartDate = new Date(event.start);
                const eventEndDate = new Date(event.end);
                const startDayOffset = Math.floor((eventStartDate - startDate) / (1000 * 60 * 60 * 24));
                const duration = Math.floor((eventEndDate - eventStartDate) / (1000 * 60 * 60 * 24)) + 1;

                const eventDiv = document.createElement('div');
                eventDiv.className = 'event';
                eventDiv.style.gridColumn = `${startDayOffset + 1} / span ${duration}`;
                eventDiv.style.gridRow = index + 1;

                const eventTitle = document.createElement('h2');
                eventTitle.textContent = event.title;
                eventDiv.appendChild(eventTitle);

                const eventImage = document.createElement('img');
                eventImage.src = event.image;
                eventImage.className = event.imgClass;
                eventDiv.appendChild(eventImage);

                timelineContent.appendChild(eventDiv);
            });
        }

        // Función para actualizar la posición del cursor
        function updateCursorPosition() {
            const now = new Date();
            const timeDiff = now - startDate;
            const daysFromStart = timeDiff / (1000 * 60 * 60 * 24);

            if (daysFromStart < 0 || daysFromStart > daysCount) {
                currentTimeCursor.style.left = `-100%`;
            } else {
                const cursorPosition = daysFromStart * dayWidth;
                currentTimeCursor.style.left = `${cursorPosition}px`;
            }

            currentTimeLabel.textContent = now.toLocaleTimeString('es-ES');
        }

        // Desplazar a la fecha actual al cargar
        function scrollToCurrentDate() {
            const now = new Date();
            const timeDiff = now - startDate;
            const daysFromStart = timeDiff / (1000 * 60 * 60 * 24);
            const scrollPosition = daysFromStart * dayWidth;

            timelineContent.scrollLeft = scrollPosition - (timelineContent.clientWidth / 2);
        }

        generateMonths();
        generateDays();
        positionEvents();
        updateCursorPosition();
        scrollToCurrentDate();

        window.addEventListener('resize', updateCursorPosition);
        setInterval(updateCursorPosition, 1000);
    }

    function setupNavbar() {
        const icons = document.querySelectorAll('.game-icon');
        icons.forEach(icon => {
            icon.addEventListener('click', () => {
                const selectedGame = icon.getAttribute('data-game');
                if (currentFilter === selectedGame) {
                    currentFilter = null;
                    positionEvents();
                } else {
                    currentFilter = selectedGame;
                    const filteredEvents = events.filter(event => event.juego === selectedGame);
                    positionEvents(filteredEvents);
                }
            });
        });
    }

    function setupResetButton() {
        const resetButton = document.getElementById('reset-filters');
        resetButton.addEventListener('click', () => {
            currentFilter = null;
            positionEvents();
        });
    }

    function loadEvents() {
        const fetchPromises = juegoFiles.map(file =>
            fetch(file)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error al cargar ${file}: ${response.statusText}`);
                    }
                    return response.json();
                })
                .catch(error => {
                    console.error(`Error procesando ${file}: ${error.message}`);
                    return [];
                })
        );

        Promise.all(fetchPromises)
            .then(data => {
                events = data.flat();
                events.sort((a, b) => {
                    if (juegoPriority[a.juego] !== juegoPriority[b.juego]) {
                        return juegoPriority[a.juego] - juegoPriority[b.juego];
                    } else {
                        return tipoPriority[a.tipo] - tipoPriority[b.tipo];
                    }
                });
                initializeTimeline();
                setupNavbar();
                setupResetButton();
            })
            .catch(error => console.error('Error al cargar los eventos:', error));
    }

    loadEvents();
});