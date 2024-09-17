// simpleClockComponent.js
class SimpleClock extends HTMLElement {
    constructor() {
        super();

        // Utwórz shadow root
        const shadow = this.attachShadow({ mode: 'open' });

        // Styl komponentu
        const style = document.createElement('style');
        style.textContent = `
            :host {
                display: block;
                margin: 0;
                background-color: #e0f7fa; /* Delikatny kolor tła */
                overflow: hidden;
            }
            canvas {
                display: block;
                margin: 0 auto;
                background-color: #a5d6a7; /* Tło przypominające las */
            }
            #sun-info {
                text-align: center;
                font-family: Arial, sans-serif;
                margin-top: 20px;
                color: #000;
            }
        `;
        shadow.appendChild(style);

        // Utwórz elementy
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 700;
        shadow.appendChild(canvas);

        const sunInfoDiv = document.createElement('div');
        sunInfoDiv.id = 'sun-info';
        shadow.appendChild(sunInfoDiv);

        const ctx = canvas.getContext('2d');

        // Zmienna czasu
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2 - 50; // Przesunięcie zegara w górę
        const clockRadius = 250;

        // Pac-Man
        let pacmanAngle = 0;
        const pacmanRadius = 20;
        let pacmanMouthOpen = true;

        // Kulki
        let dots = [];
        const totalDots = 60;
        initializeDots();

        function initializeDots() {
            dots = [];
            for (let i = 0; i < totalDots; i++) {
                const angle = (i / totalDots) * 2 * Math.PI - Math.PI / 2;
                dots.push({
                    x: centerX + (clockRadius + 40) * Math.cos(angle),
                    y: centerY + (clockRadius + 40) * Math.sin(angle),
                    eaten: false,
                    isBig: i === 0 // Duża kulka na pozycji 0
                });
            }
        }

        // Czas wschodu i zachodu słońca (przybliżone) - tylko Warszawa
        const sunTimes = {
            Warszawa: { sunrise: 6, sunset: 18 }
        };

        // Funkcja rysująca tarczę zegara
        const drawClock = () => {
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.beginPath();
            ctx.arc(0, 0, clockRadius, 0, 2 * Math.PI);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.lineWidth = 5;
            ctx.strokeStyle = '#000';
            ctx.stroke();

            // Cyfry
            ctx.fillStyle = '#000';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (let num = 1; num <= 12; num++) {
                const angle = (num / 12) * 2 * Math.PI - Math.PI / 2;
                const x = (clockRadius - 30) * Math.cos(angle);
                const y = (clockRadius - 30) * Math.sin(angle);
                ctx.fillText(num.toString(), x, y);
            }

            // Wskazówki
            const now = new Date();
            const hour = now.getHours() % 12;
            const minute = now.getMinutes();
            const second = now.getSeconds();

            // Wskazówka godzinowa
            let hourAngle = ((hour + minute / 60) / 12) * 2 * Math.PI - Math.PI / 2;
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(
                (clockRadius - 100) * Math.cos(hourAngle),
                (clockRadius - 100) * Math.sin(hourAngle)
            );
            ctx.stroke();

            // Wskazówka minutowa
            let minuteAngle = ((minute + second / 60) / 60) * 2 * Math.PI - Math.PI / 2;
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(
                (clockRadius - 70) * Math.cos(minuteAngle),
                (clockRadius - 70) * Math.sin(minuteAngle)
            );
            ctx.stroke();

            // Wskazówka sekundowa
            let secondAngle = (second / 60) * 2 * Math.PI - Math.PI / 2;
            ctx.strokeStyle = '#f44336';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(
                (clockRadius - 50) * Math.cos(secondAngle),
                (clockRadius - 50) * Math.sin(secondAngle)
            );
            ctx.stroke();

            ctx.restore();
        };

        // Funkcja rysująca słońce i księżyc
        const drawSunAndMoon = () => {
            const now = new Date();
            const hours = now.getHours() + now.getMinutes() / 60;
            const dayProgress = (hours / 24) * 2 * Math.PI - Math.PI / 2;

            const sunX = centerX + 300 * Math.cos(dayProgress);
            const sunY = centerY - 50 + 200 * Math.sin(dayProgress);

            if (hours >= 6 && hours < 18) {
                // Słońce
                ctx.fillStyle = '#ffeb3b';
                ctx.beginPath();
                ctx.arc(sunX, sunY, 30, 0, 2 * Math.PI);
                ctx.fill();
            } else {
                // Księżyc
                ctx.fillStyle = '#cfd8dc';
                ctx.beginPath();
                ctx.arc(sunX, sunY, 30, 0, 2 * Math.PI);
                ctx.fill();
            }
        };

        // Funkcja rysująca Pac-Mana
        const drawPacman = () => {
            // Poruszanie Pac-Mana
            const now = new Date();
            const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
            pacmanAngle = (seconds / 60) * 2 * Math.PI;

            // Co pół sekundy Pac-Man otwiera i zamyka buzię
            pacmanMouthOpen = Math.floor(now.getMilliseconds() / 250) % 2 === 0;

            // Pozycja Pac-Mana
            const pacX = centerX + (clockRadius + 40) * Math.cos(pacmanAngle - Math.PI / 2);
            const pacY = centerY + (clockRadius + 40) * Math.sin(pacmanAngle - Math.PI / 2);

            // Rysuj Pac-Mana
            ctx.save();
            ctx.translate(pacX, pacY);
            ctx.rotate(pacmanAngle);
            ctx.beginPath();
            const mouthAngle = pacmanMouthOpen ? 0.2 : 0;
            ctx.moveTo(0, 0);
            ctx.arc(
                0,
                0,
                pacmanRadius,
                (mouthAngle) * Math.PI,
                (2 - mouthAngle) * Math.PI,
                false
            );
            ctx.closePath();
            ctx.fillStyle = '#ffeb3b';
            ctx.fill();
            ctx.restore();
        };

        // Funkcja rysująca kulki
        const drawDots = () => {
            ctx.fillStyle = '#ffffff';
            dots.forEach((dot, index) => {
                // Sprawdź, czy Pac-Man zjadł kulkę
                const dx = dot.x - (centerX + (clockRadius + 40) * Math.cos(pacmanAngle - Math.PI / 2));
                const dy = dot.y - (centerY + (clockRadius + 40) * Math.sin(pacmanAngle - Math.PI / 2));
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < pacmanRadius && !dot.eaten) {
                    dot.eaten = true;
                }

                if (!dot.eaten) {
                    ctx.beginPath();
                    ctx.arc(dot.x, dot.y, dot.isBig ? 8 : 4, 0, 2 * Math.PI);
                    ctx.fill();
                }
            });

            // Resetuj kulki co minutę
            if (dots.every(dot => dot.eaten)) {
                initializeDots();
            }
        };

        // Funkcja aktualizująca informacje o wschodzie i zachodzie słońca
        const updateSunsetSunriseInfo = () => {
            let infoHTML = '';

            // Tylko Warszawa
            const city = 'Warszawa';
            const now = new Date();
            const totalSecondsNow = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

            const sunriseSeconds = sunTimes[city].sunrise * 3600;
            const sunsetSeconds = sunTimes[city].sunset * 3600;

            let timeToSunrise = sunriseSeconds - totalSecondsNow;
            let timeToSunset = sunsetSeconds - totalSecondsNow;

            if (timeToSunrise < 0) timeToSunrise += 86400; // Dodaj 24 godziny w sekundach
            if (timeToSunset < 0) timeToSunset += 86400;

            const hoursToSunrise = Math.floor(timeToSunrise / 3600);
            const minutesToSunrise = Math.floor((timeToSunrise % 3600) / 60);
            const secondsToSunrise = Math.floor(timeToSunrise % 60);

            const hoursToSunset = Math.floor(timeToSunset / 3600);
            const minutesToSunset = Math.floor((timeToSunset % 3600) / 60);
            const secondsToSunset = Math.floor(timeToSunset % 60);

            infoHTML += `
                <p><strong>${city}</strong>: do wschodu słońca ${hoursToSunrise}h ${minutesToSunrise}m ${secondsToSunrise}s, do zachodu słońca ${hoursToSunset}h ${minutesToSunset}m ${secondsToSunset}s</p>
            `;

            sunInfoDiv.innerHTML = infoHTML;
        };

        // Funkcja animująca zegar
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawSunAndMoon();
            drawClock();
            drawDots();
            drawPacman();
            requestAnimationFrame(animate);
        };

        // Rozpocznij animację
        animate();
        updateSunsetSunriseInfo();
        setInterval(updateSunsetSunriseInfo, 1000);
    }
}

// Definiujemy niestandardowy element
customElements.define('simple-clock', SimpleClock);
