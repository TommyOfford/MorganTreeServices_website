/*
   File: script.js
   Author: Thomas Morgan Offord
   Updated: 2026-01-02
   Description: Handles interactive services section for Morgan Tree Services.
*/

document.addEventListener("DOMContentLoaded", () => {
    const services = {
        reduction: {
            title: "Reduction / Pruning",
            image: "images/tree1.jpg",
            description: "Careful pruning and crown reduction to maintain tree health, safety, and appearance."
        },
        removal: {
            title: "Tree Removals",
            image: "images/removal.jpg",
            description: "Safe and controlled removal of trees, including difficult or restricted-access locations."
        },
        lifting: {
            title: "Crown Lifting",
            image: "images/lift.jpg",
            description: "Raising the canopy to improve access, light, and clearance around property."
        },
        hedges: {
            title: "Hedge Trimming",
            image: "images/hedge.jpg",
            description: "Regular and one-off hedge maintenance to keep gardens tidy and healthy."
        },
        clearance: {
            title: "Garden Clearance",
            image: "images/clearance.jpg",
            description: "Full garden and site clearance, including green waste removal."
        }
    };

    const grid = document.getElementById("servicesGrid");
    const detail = document.getElementById("serviceDetail");
    const detailTitle = document.getElementById("detailTitle");
    const detailDescription = document.getElementById("detailDescription");
    const detailImage = document.getElementById("detailImage");

    document.querySelectorAll(".service-panel").forEach(panel => {
        panel.addEventListener("click", () => {
            const service = services[panel.dataset.service];

            detailTitle.textContent = service.title;
            detailDescription.textContent = service.description;
            detailImage.src = service.image;
            detailImage.alt = service.title;

            // Show detail with fade-in
            grid.style.display = "none";
            detail.classList.remove("hidden");
            detail.setAttribute("aria-hidden", "false");

            // Accessibility
            panel.setAttribute("aria-expanded", "true");
        });
    });

    document.getElementById("backToServices").addEventListener("click", () => {
        detail.classList.add("hidden");
        grid.style.display = "grid";
        detail.setAttribute("aria-hidden", "true");
    });
});
