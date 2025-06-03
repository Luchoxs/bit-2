"use strict";
const d = document;

d.addEventListener("DOMContentLoaded", () => {
  const carouselInner = d.getElementById("carousel-inner");
  const carouselIndicators = d.getElementById("carouselIndicators");

  // Mostrar estado de carga
  carouselInner.innerHTML =
    '<div class="loading-state">Cargando datos de estudiantes...</div>';

  fetch("JSON/file.json")
    .then((response) => response.json())
    .then((data) => {
      carouselInner.innerHTML = "";
      const tableBody = d.getElementById("students-table-body");
      const carouselIndicators = d.getElementById("carouselIndicators");
      const topStudents = data
        .map((student) => ({
          ...student,
          avgScore: parseFloat(calculateAverageScore(student.projects)) || 0,
        }))
        .sort((a, b) => b.avgScore - a.avgScore)
        .slice(0, 10);

      topStudents.forEach((student, index) => {
        // Crear indicadores
        const indicator = d.createElement("button");
        indicator.type = "button";
        indicator.dataset.bsTarget = "#studentCarousel";
        indicator.dataset.bsSlideTo = index;
        if (index === 0) indicator.classList.add("active");
        carouselIndicators.appendChild(indicator);

        // Crear elemento del carrusel
        const carouselItem = d.createElement("div");
        carouselItem.className = `carousel-item ${index === 0 ? "active" : ""}`;

        // Crear tarjeta (contenido existente)
        const card = `
                    <div class="card student-card mx-auto" style="width: 18rem;">
                        <img src="${
                          student.usernameGithub
                            ? `https://github.com/${student.usernameGithub}.png`
                            : "./assets/image_not_found.jpg"
                        }" 
                             class="card-img-top student-img" alt="${
                               student.student
                             }">
                        <div class="card-body">
                            <h5 class="card-title">${student.code} - ${
                            student.student
                            }
                            </h5>
                            <p class="card-text">Intensidad: ${
                              student.intensity
                            }</p>
                            <p class="card-text">Promedio: ${student.avgScore.toFixed(
                              1
                            )}</p>
                            <div class="d-flex justify-content-between">
                                <button class="btn btn-primary btn-sm view-profile" data-student-id="${student.code}">
                                    Ver perfil
                                </button>
                                ${student.usernameGithub ? 
                                    `<a href="https://github.com/${student.usernameGithub}" target="_blank" class="btn btn-outline-dark btn-sm">
                                        GitHub
                                    </a>` 
                                    : 
                                    '<button class="btn btn-outline-dark btn-sm" disabled>Sin GitHub</button>'
                                }
                            </div>
                    </div>
                `;

        carouselItem.innerHTML = card;
        carouselInner.appendChild(carouselItem);
      });

      // Filtrar estudiantes que NO están en el top 10
      const studentsForTable = data.filter(
        (student) =>
          !topStudents.some((topStudent) => topStudent.code === student.code)
      );

      // Tabla completa (solo estudiantes no mostrados en carrusel)
      studentsForTable.forEach((student) => {
        const row = d.createElement("tr");
        const projectsCount = student.projects.length;
        const avgScore = calculateAverageScore(student.projects);

        row.innerHTML = `
            <td>${student.code}</td>
            <td>${student.student}</td>
            <td>${student.intensity}</td>
            <td>${projectsCount} proyectos (${avgScore} avg)</td>
            <td>
                <button class="btn btn-primary btn-sm view-profile" data-student-id="${student.code}" >
                    Ver perfil
                </button>
            </td>
        `;
        tableBody.appendChild(row);
        document.querySelectorAll(".view-profile").forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.preventDefault();
            window.open(
              `pages/profile.html?id=${btn.dataset.studentId}`,
              "_blank"
            );
          });
        });
      });

      // Actualizar indicadores al cambiar slide
      document
        .getElementById("studentCarousel")
        .addEventListener("slid.bs.carousel", function () {
          const activeIndex = [
            ...this.querySelectorAll(".carousel-item"),
          ].findIndex((item) => item.classList.contains("active"));
          const indicators = document.querySelectorAll(
            ".carousel-indicators button"
          );
          indicators.forEach((indicator, index) => {
            indicator.classList.toggle("active", index === activeIndex);
          });
        });
    })
    .catch((error) => {
      console.error("Error:", error);
      carouselInner.innerHTML =
        '<div class="loading-state error">Error al cargar los datos</div>';
    });
});

function calculateAverageScore(projects) {
  if (!projects || projects.length === 0) return "N/A";

  const projectScores = projects.map((project) => {
    if (!project.score || project.score.length === 0) return 0;

    // Suma todos los scores del proyecto
    const sum = project.score.reduce((total, score) => total + score, 0);

    // Si tiene más de un score, dividir entre 2
    return project.score.length > 1 || project.score > 5 ? sum / 2 : sum;
  });

  // Calcula el promedio total
  const totalAverage =
    projectScores.reduce((sum, score) => sum + score, 0) / projects.length;
  return totalAverage.toFixed(1);
}
