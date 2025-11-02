const canvas = document.getElementById('universe-canvas');
const ctx = canvas.getContext('2d');
const habits = JSON.parse(localStorage.getItem('habits')) || [];
let animationId;
let stars = []; 
let trails = {}; 


for (let i = 0; i < 200; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2,
        opacity: Math.random()
    });
}


const sun = { x: canvas.width / 2, y: canvas.height / 2, radius: 50, glowRadius: 70 };


const planetColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b'];
let planets = [];

function loadHabits() {
    document.getElementById('habits-list').innerHTML = '';
    planets = [];
    habits.forEach((habit, index) => {
        const div = document.createElement('div');
        div.className = 'habit-item';
        div.innerHTML = `
            <span>${habit.name} (Streak: ${habit.streak})</span>
            <button onclick="completeHabit(${index})">Complete</button>
            <button onclick="missHabit(${index})">Miss</button>
        `;
        document.getElementById('habits-list').appendChild(div);
        
        planets.push({
            name: habit.name,
            radius: Math.max(10, habit.streak * 2),
            distance: 100 + index * 50,
            angle: 0,
            speed: 0.01 + index * 0.005,
            color: planetColors[index % planetColors.length],
            streak: habit.streak,
            trail: []
        });
        trails[habit.name] = [];
    });
    saveHabits();
}


document.getElementById('add-habit-btn').addEventListener('click', () => {
    const name = document.getElementById('habit-input').value.trim();
    if (name) {
        habits.push({ name, streak: 0, lastCompleted: null });
        document.getElementById('habit-input').value = '';
        loadHabits();
    }
});


function completeHabit(index) {
    const today = new Date().toDateString();
    if (habits[index].lastCompleted !== today) {
        habits[index].streak++;
        habits[index].lastCompleted = today;
        loadHabits();
    }
}

function missHabit(index) {
    habits[index].streak = Math.max(0, habits[index].streak - 1);
    loadHabits();
}


function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
}


function drawStars() {
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
    });
}


function drawSun() {
    const gradient = ctx.createRadialGradient(sun.x, sun.y, sun.radius, sun.x, sun.y, sun.glowRadius);
    gradient.addColorStop(0, '#ffd700');
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.beginPath();
    ctx.arc(sun.x, sun.y, sun.glowRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(sun.x, sun.y, sun.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;
    
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6;
        const x1 = sun.x + Math.cos(angle) * (sun.radius + 10);
        const y1 = sun.y + Math.sin(angle) * (sun.radius + 10);
        const x2 = sun.x + Math.cos(angle) * (sun.radius + 30);
        const y2 = sun.y + Math.sin(angle) * (sun.radius + 30);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
}


function drawPlanets() {
    planets.forEach(planet => {
        planet.angle += planet.speed;
        const x = sun.x + Math.cos(planet.angle) * planet.distance;
        const y = sun.y + Math.sin(planet.angle) * planet.distance;
        
        trails[planet.name].push({ x, y });
        if (trails[planet.name].length > 50) trails[planet.name].shift();
        
        ctx.strokeStyle = planet.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        trails[planet.name].forEach((point, i) => {
            if (i === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
        
        const planetGradient = ctx.createRadialGradient(x, y, 0, x, y, planet.radius);
        planetGradient.addColorStop(0, planet.color);
        planetGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(x, y, planet.radius, 0, Math.PI * 2);
        ctx.fillStyle = planetGradient;
        ctx.shadowColor = planet.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#fff';
        ctx.font = '12px Orbitron';
        ctx.fillText(planet.name, x - planet.radius, y - planet.radius - 10);
    });
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStars();
    drawSun();
    drawPlanets();
    animationId = requestAnimationFrame(animate);
}

loadHabits();
animate();