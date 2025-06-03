document.addEventListener('DOMContentLoaded', () => {
    // Obtener ID del estudiante desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('id');
    
    if (!studentId) {
        alert('ID de estudiante no especificado');
        window.location.href = '../index.html';
        return;
    }

    // Cargar datos del JSON
    fetch('../JSON/file.json')
        .then(response => response.json())
        .then(data => {
            const student = data.find(s => s.code === studentId);
            
            if (!student) {
                alert('Estudiante no encontrado');
                window.location.href = '../index.html';
                return;
            }

            // Mostrar datos básicos
            document.getElementById('student-name').textContent = student.student;
            document.getElementById('student-code').textContent = `Código: ${student.code}`;
            document.getElementById('student-intensity').textContent = student.intensity;
            
            // Foto de GitHub o placeholder
            const profileImg = document.getElementById('profile-image');
            profileImg.src = student.usernameGithub 
                ? `https://github.com/${student.usernameGithub}.png`
                : '../assets/image_not_found.jpg';
            
            // Configurar botón GitHub
            const githubBtn = document.getElementById('github-profile-btn');
            if (student.usernameGithub) {
                githubBtn.href = `https://github.com/${student.usernameGithub}`;
            } else {
                githubBtn.classList.replace('btn-outline-dark', 'btn-secondary');
                githubBtn.textContent = 'Sin GitHub';
                githubBtn.removeAttribute('href');
                githubBtn.style.pointerEvents = 'none';
            }

            // Mostrar proyectos
            const projectsList = document.getElementById('projects-list');
            student.projects.forEach(project => {
                const projectEl = document.createElement('div');
                projectEl.className = 'project-item';
                
                const sum = project.score.reduce((total, score) => total + score, 0);
                const scoresText = project.score.length > 1  || project.score > 5
                    ? `Nota: ${sum / 2}`
                    : `Nota: ${sum}`;
                
                projectEl.innerHTML = `
                    <h4 class="project-name">${project.name}</h4>
                    <div class="project-scores">${scoresText}</div>
                `;
                projectsList.appendChild(projectEl);
            });

            // Configurar gráfico
            renderPerformanceChart(student);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al cargar los datos');
        });
});

function renderPerformanceChart(student) {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    
    const labels = student.projects.map(p => p.name);
    const data = student.projects.map(p => {
        return p.score.reduce((a, b) => a + b, 0) / p.score.length;
    });

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Promedio por proyecto',
                data: data,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(75, 192, 192, 0.7)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10
                }
            }
        }
    });
}